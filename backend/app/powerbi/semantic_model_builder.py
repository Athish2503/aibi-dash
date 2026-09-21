import os
import re
from typing import Optional, Union
import pandas as pd

from backend.app.agent.plan_schemas import (
    MeasureSpec,
    AggregationType,
    MeasureFormat,
)
from backend.app.data.schemas import DatasetProfileResult
from backend.app.powerbi.schemas import (
    TMSLDatabase,
    TMSLModel,
    TMSLTable,
    TMSLColumn,
    TMSLMeasure,
    TMSLPartition,
    TMSLPartitionSource,
    TMSLDataType,
    PBISMDefinition,
)


class SemanticModelBuilder:
    """
    Builds Power BI Tabular Model (TMSL/BIM) and PBISM definitions
    conforming to Power BI Desktop compatibility level 1550/1600.
    """

    FORMAT_STRINGS = {
        MeasureFormat.CURRENCY: "$#,0.00;($#,0.00);$#,0.00",
        MeasureFormat.PERCENTAGE: "0.0%",
        MeasureFormat.INTEGER: "#,0",
        MeasureFormat.NUMBER: "#,0.00",
    }

    @staticmethod
    def sanitize_table_name(name: str) -> str:
        """Sanitizes dataset/file name into a valid Power BI table name."""
        base = os.path.splitext(os.path.basename(name))[0]
        cleaned = re.sub(r"[^a-zA-Z0-9_ ]", "", base).strip()
        if not cleaned or cleaned.isdigit():
            return "Campaigns"
        return cleaned.replace(" ", "_")

    @classmethod
    def map_dtype_to_tmsl(cls, col_type: str) -> TMSLDataType:
        """Maps pandas/numpy dtype strings to TMSL data types."""
        col_type_lower = col_type.lower()
        if any(t in col_type_lower for t in ["int", "int64", "int32"]):
            return TMSLDataType.INT64
        elif any(t in col_type_lower for t in ["float", "double", "float64", "float32", "decimal"]):
            return TMSLDataType.DOUBLE
        elif any(t in col_type_lower for t in ["date", "time", "datetime"]):
            return TMSLDataType.DATETIME
        elif any(t in col_type_lower for t in ["bool"]):
            return TMSLDataType.BOOLEAN
        else:
            return TMSLDataType.STRING

    @classmethod
    def generate_dax_expression(cls, measure: MeasureSpec, table_name: str) -> str:
        """
        Generates production-grade DAX calculation expression for a measure.
        Uses measure.dax_expression if explicitly provided, else builds from aggregation.
        """
        if measure.dax_expression and measure.dax_expression.strip():
            return measure.dax_expression.strip()

        col_ref = f"'{table_name}'[{measure.column}]"
        agg = measure.aggregation

        if agg == AggregationType.SUM:
            return f"SUM({col_ref})"
        elif agg == AggregationType.AVG:
            return f"AVERAGE({col_ref})"
        elif agg == AggregationType.COUNT:
            return f"COUNT({col_ref})"
        elif agg == AggregationType.DISTINCT_COUNT:
            return f"DISTINCTCOUNT({col_ref})"
        elif agg == AggregationType.MIN:
            return f"MIN({col_ref})"
        elif agg == AggregationType.MAX:
            return f"MAX({col_ref})"
        else:
            return f"AVERAGE({col_ref})"

    @classmethod
    def build_m_partition_expression(
        cls,
        table_name: str,
        data_source_path: Optional[str] = None,
        columns: Optional[list[str]] = None,
    ) -> list[str]:
        """
        Generates Power Query (M) partition formula for importing dataset.
        Uses normalized forward slashes or relative data source references.
        """
        file_path = (data_source_path or f"./data/{table_name}.csv").replace("\\", "/")
        is_excel = file_path.lower().endswith(".xlsx") or file_path.lower().endswith(".xls")

        if is_excel:
            return [
                "let",
                f'    Source = Excel.Workbook(File.Contents("{file_path}"), null, true),',
                '    Sheet1_Sheet = Source{[Item="Sheet1",Kind="Sheet"]}[Data],',
                '    #"Promoted Headers" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])',
                "in",
                '    #"Promoted Headers"',
            ]
        else:
            return [
                "let",
                f'    Source = Csv.Document(File.Contents("{file_path}"),[Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.None]),',
                '    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])',
                "in",
                '    #"Promoted Headers"',
            ]

    def build_semantic_model(
        self,
        dataset_name: str,
        columns_info: Union[dict[str, str], list[str], pd.DataFrame, DatasetProfileResult],
        measures: list[MeasureSpec],
        data_source_path: Optional[str] = None,
    ) -> TMSLDatabase:
        """
        Constructs the complete TMSLDatabase (model.bim).
        """
        table_name = self.sanitize_table_name(dataset_name)

        # 1. Parse columns and data types
        tmsl_columns: list[TMSLColumn] = []
        col_names: list[str] = []

        if isinstance(columns_info, pd.DataFrame):
            for col in columns_info.columns:
                col_names.append(col)
                dtype = self.map_dtype_to_tmsl(str(columns_info[col].dtype))
                tmsl_columns.append(
                    TMSLColumn(name=col, dataType=dtype, sourceColumn=col)
                )
        elif isinstance(columns_info, DatasetProfileResult):
            for col, prof in columns_info.columns.items():
                col_names.append(col)
                dtype = self.map_dtype_to_tmsl(prof.inferred_type)
                tmsl_columns.append(
                    TMSLColumn(name=col, dataType=dtype, sourceColumn=col)
                )
        elif isinstance(columns_info, dict):
            for col, dtype_str in columns_info.items():
                col_names.append(col)
                dtype = self.map_dtype_to_tmsl(dtype_str)
                tmsl_columns.append(
                    TMSLColumn(name=col, dataType=dtype, sourceColumn=col)
                )
        elif isinstance(columns_info, list):
            for col in columns_info:
                col_names.append(col)
                tmsl_columns.append(
                    TMSLColumn(name=col, dataType=TMSLDataType.STRING, sourceColumn=col)
                )

        # 2. Build DAX measures
        tmsl_measures: list[TMSLMeasure] = []
        for m in measures:
            expr = self.generate_dax_expression(m, table_name)
            fmt = self.FORMAT_STRINGS.get(m.format, "#,0.00")
            tmsl_measures.append(
                TMSLMeasure(
                    name=m.name,
                    expression=expr,
                    formatString=fmt,
                    description=m.description or f"{m.aggregation.value} of {m.column}",
                )
            )

        # 3. Build partition
        m_lines = self.build_m_partition_expression(table_name, data_source_path, col_names)
        partition = TMSLPartition(
            name=table_name,
            mode="import",
            source=TMSLPartitionSource(type="m", expression=m_lines),
        )

        # 4. Assemble table and model
        table = TMSLTable(
            name=table_name,
            columns=tmsl_columns,
            measures=tmsl_measures,
            partitions=[partition],
        )

        model = TMSLModel(
            culture="en-US",
            tables=[table],
            defaultPowerBIDataSourceVersion="powerBI_V3",
        )

        return TMSLDatabase(
            name=table_name,
            compatibilityLevel=1550,
            model=model,
        )

    def build_definition_pbism(self) -> PBISMDefinition:
        """Returns standard definition.pbism for the semantic model folder."""
        return PBISMDefinition(version="1.0")
