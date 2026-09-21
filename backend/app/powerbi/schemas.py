from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class TMSLDataType(str, Enum):
    STRING = "string"
    INT64 = "int64"
    DOUBLE = "double"
    DATETIME = "dateTime"
    BOOLEAN = "boolean"


class TMSLColumn(BaseModel):
    name: str
    dataType: TMSLDataType = TMSLDataType.STRING
    sourceColumn: str
    formatString: Optional[str] = None
    summarizeBy: Optional[str] = "none"


class TMSLMeasure(BaseModel):
    name: str
    expression: str
    formatString: Optional[str] = None
    description: Optional[str] = None


class TMSLPartitionSource(BaseModel):
    type: str = "m"
    expression: list[str] = Field(default_factory=list)


class TMSLPartition(BaseModel):
    name: str
    mode: str = "import"
    source: TMSLPartitionSource


class TMSLTable(BaseModel):
    name: str
    columns: list[TMSLColumn] = Field(default_factory=list)
    measures: list[TMSLMeasure] = Field(default_factory=list)
    partitions: list[TMSLPartition] = Field(default_factory=list)


class TMSLModel(BaseModel):
    culture: str = "en-US"
    tables: list[TMSLTable] = Field(default_factory=list)
    defaultPowerBIDataSourceVersion: str = "powerBI_V3"


class TMSLDatabase(BaseModel):
    """Complete TMSL Model (model.bim)."""
    name: str
    compatibilityLevel: int = 1550
    model: TMSLModel


# --- PBIP / PBIR Report Models ---

class PBIPArtifactReport(BaseModel):
    path: str


class PBIPArtifact(BaseModel):
    report: PBIPArtifactReport


class PBIPSettings(BaseModel):
    enableAutoAuth: bool = True


class PBIPManifest(BaseModel):
    """Manifest file for Power BI Project (.pbip)."""
    version: str = "1.0"
    artifacts: list[PBIPArtifact]
    settings: PBIPSettings = Field(default_factory=PBIPSettings)


class PBIRDatasetReferenceByPath(BaseModel):
    path: str


class PBIRDatasetReference(BaseModel):
    byPath: Optional[PBIRDatasetReferenceByPath] = None
    byConnection: Optional[Any] = None


class PBIRDefinition(BaseModel):
    """Report reference definition (definition.pbir)."""
    version: str = "1.0"
    datasetReference: PBIRDatasetReference


class PBISMDefinition(BaseModel):
    """Semantic model definition (definition.pbism)."""
    version: str = "1.0"


class ReportVisualPosition(BaseModel):
    x: int
    y: int
    width: int
    height: int
    z: int = 0


class ReportVisualContainer(BaseModel):
    """Specification of an individual visual container in report.json."""
    id: str
    type: str
    title: str
    x: int
    y: int
    width: int
    height: int
    z: int = 0
    config: dict[str, Any] = Field(default_factory=dict)
    query: dict[str, Any] = Field(default_factory=dict)
    filters: list[dict[str, Any]] = Field(default_factory=list)


class ReportPage(BaseModel):
    """Page representation in report.json."""
    id: str
    name: str
    displayName: str
    width: int = 1280
    height: int = 720
    visualContainers: list[ReportVisualContainer] = Field(default_factory=list)


class ReportDefinition(BaseModel):
    """Top-level report.json format."""
    config: dict[str, Any] = Field(default_factory=dict)
    layoutOptimization: int = 0
    pages: list[ReportPage] = Field(default_factory=list)


# --- Generation & Validation Models ---

class PowerBIValidationResult(BaseModel):
    """Results of structural and semantic validation on generated Power BI artifacts."""
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    checked_components: list[str] = Field(default_factory=list)


class DesktopEnvironmentStatus(BaseModel):
    """Diagnostic check of the local Power BI Desktop environment."""
    is_installed: bool
    executable_path: Optional[str] = None
    version: Optional[str] = None
    can_launch: bool = False
    file_association_detected: bool = False
    detection_method: Optional[str] = None
    notes: str = ""


class PowerBIGenerationResult(BaseModel):
    """Summary of the generated Power BI Project artifacts."""
    artifact_id: str
    project_name: str
    output_dir: str
    pbip_path: str
    zip_path: Optional[str] = None
    files_created: list[str] = Field(default_factory=list)
    validation: PowerBIValidationResult
    desktop_status: DesktopEnvironmentStatus
