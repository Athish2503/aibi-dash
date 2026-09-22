import re
from typing import Optional
from pydantic import BaseModel, Field

# Comprehensive set of recognized standard DAX functions
STANDARD_DAX_FUNCTIONS = {
    # Aggregation
    "SUM", "AVERAGE", "MIN", "MAX", "COUNT", "COUNTA", "COUNTROWS", "COUNTBLANK",
    "DISTINCTCOUNT", "PRODUCT",
    # Iterators (X functions)
    "SUMX", "AVERAGEX", "MINX", "MAXX", "COUNTX", "COUNTAX", "PRODUCTX", "RANKX",
    "CONCATENATEX",
    # Filter & Context
    "CALCULATE", "CALCULATETABLE", "FILTER", "ALL", "ALLEXCEPT", "ALLSELECTED",
    "ALLNOBLANKROW", "VALUES", "DISTINCT", "KEEPFILTERS", "REMOVEFILTERS",
    "SELECTEDVALUE", "LOOKUPVALUE", "RELATED", "RELATEDTABLE", "USERELATIONSHIP",
    # Time Intelligence
    "DATEADD", "DATESBETWEEN", "DATESINPERIOD", "DATESMTD", "DATESQTD", "DATESYTD",
    "ENDOFMONTH", "ENDOFQUARTER", "ENDOFYEAR", "FIRSTDATE", "LASTDATE",
    "PARALLELPERIOD", "PREVIOUSDAY", "PREVIOUSMONTH", "PREVIOUSQUARTER", "PREVIOUSYEAR",
    "SAMEPERIODLASTYEAR", "STARTOFMONTH", "STARTOFQUARTER", "STARTOFYEAR",
    "TOTALMTD", "TOTALQTD", "TOTALYTD",
    # Date & Time
    "DATE", "DATEDIFF", "DATEVALUE", "DAY", "MONTH", "YEAR", "HOUR", "MINUTE",
    "SECOND", "NOW", "TODAY", "WEEKDAY", "WEEKNUM", "EDATE", "EOMONTH",
    # Logical & Information
    "IF", "IFERROR", "SWITCH", "AND", "OR", "NOT", "TRUE", "FALSE", "BLANK",
    "ISBLANK", "ISERROR", "ISNUMBER", "ISTEXT", "COALESCE",
    # Mathematical & Trigonometric
    "DIVIDE", "ABS", "EXP", "LN", "LOG", "LOG10", "MOD", "ROUND", "ROUNDUP",
    "ROUNDDOWN", "INT", "POWER", "SQRT",
    # Text
    "CONCATENATE", "EXACT", "FIND", "FORMAT", "LEFT", "LEN", "LOWER", "MID",
    "REPLACE", "REPT", "RIGHT", "SEARCH", "SUBSTITUTE", "TRIM", "UPPER", "VALUE",
    # Table Manipulation
    "TOPN", "ADDCOLUMNS", "SUMMARIZE", "SUMMARIZECOLUMNS", "SELECTCOLUMNS",
    "CROSSJOIN", "UNION", "INTERSECT", "EXCEPT", "NATURALINNERJOIN", "NATURALLEFTOUTERJOIN",
}


class DAXValidationResult(BaseModel):
    is_valid: bool = Field(description="Whether the DAX formula is syntactically valid and references valid columns")
    errors: list[str] = Field(default_factory=list, description="List of fatal syntax or reference errors")
    warnings: list[str] = Field(default_factory=list, description="List of best-practice warnings or suggestions")
    referenced_columns: list[str] = Field(default_factory=list, description="Columns referenced in the expression")
    referenced_measures: list[str] = Field(default_factory=list, description="Measures referenced in the expression")
    used_functions: list[str] = Field(default_factory=list, description="Standard DAX functions used")
    complexity: str = Field(default="Standard", description="Estimated formula complexity: Standard, Intermediate, or Advanced")


class DeterministicDAXValidator:
    """
    Deterministic validator for Power BI DAX formulas.
    Validates token pairing, function names, column references against
    the active table schema, and measure dependencies.
    """

    @classmethod
    def validate(
        cls,
        expression: str,
        table_name: str = "Campaigns",
        available_columns: Optional[list[str]] = None,
        available_measures: Optional[list[str]] = None,
    ) -> DAXValidationResult:
        errors: list[str] = []
        warnings: list[str] = []

        if not expression or not expression.strip():
            return DAXValidationResult(
                is_valid=False,
                errors=["DAX expression cannot be empty."],
                complexity="Standard",
            )

        expr = expression.strip()

        # 1. Balanced Parentheses, Brackets, and Quotes
        paren_balance = 0
        bracket_balance = 0
        in_string = False
        in_table_quote = False

        i = 0
        while i < len(expr):
            ch = expr[i]

            if ch == '"' and not in_table_quote:
                # String literal toggle
                in_string = not in_string
            elif ch == "'" and not in_string:
                # Table name quote toggle
                in_table_quote = not in_table_quote
            elif not in_string and not in_table_quote:
                if ch == "(":
                    paren_balance += 1
                elif ch == ")":
                    paren_balance -= 1
                    if paren_balance < 0:
                        errors.append(f"Unmatched closing parenthesis ')' at position {i}.")
                elif ch == "[":
                    bracket_balance += 1
                elif ch == "]":
                    bracket_balance -= 1
                    if bracket_balance < 0:
                        errors.append(f"Unmatched closing bracket ']' at position {i}.")
            i += 1

        if in_string:
            errors.append("Unterminated string literal: missing closing double quote '\"'.")
        if in_table_quote:
            errors.append("Unterminated table reference: missing closing single quote '''.")
        if paren_balance > 0:
            errors.append(f"Missing {paren_balance} closing parenthesis ')'.")
        if bracket_balance > 0:
            errors.append(f"Missing {bracket_balance} closing bracket ']'.")

        # 2. Extract referenced columns and measures
        # Pattern for fully qualified column: 'Table'[Column] or Table[Column]
        col_pattern = re.compile(r"(?:'([^']+)'|([a-zA-Z0-9_]+))\[([^\]]+)\]")
        # Pattern for standalone bracket reference: [Item]
        item_pattern = re.compile(r"(?<!['\w])\[([^\]]+)\]")

        referenced_columns: list[str] = []
        referenced_measures: list[str] = []
        external_table_refs: list[str] = []

        # Find qualified columns first
        qualified_matches = col_pattern.findall(expr)
        for tbl_quoted, tbl_unquoted, col in qualified_matches:
            tbl_name = (tbl_quoted or tbl_unquoted or "").strip()
            col_clean = col.strip()
            if tbl_name and tbl_name.lower() != table_name.lower():
                external_table_refs.append(f"'{tbl_name}'[{col_clean}]")
            else:
                if col_clean and col_clean not in referenced_columns:
                    referenced_columns.append(col_clean)

        # Find standalone bracket references [Name]
        standalone_matches = item_pattern.findall(expr)
        for item in standalone_matches:
            item_clean = item.strip()
            if item_clean not in referenced_columns and item_clean not in referenced_measures:
                if available_measures and item_clean in available_measures:
                    referenced_measures.append(item_clean)
                elif available_columns and item_clean in available_columns:
                    referenced_columns.append(item_clean)
                else:
                    referenced_measures.append(item_clean)

        # 3. Validate current table columns against available schema
        if available_columns:
            avail_cols_lower = {c.lower(): c for c in available_columns}
            for col in referenced_columns:
                if col.lower() not in avail_cols_lower:
                    errors.append(
                        f"Referenced column '[{col}]' does not exist in dataset schema. "
                        f"Available columns: {', '.join(sorted(available_columns))}."
                    )

        if external_table_refs:
            for ext in external_table_refs:
                warnings.append(f"Formula references external/date table: {ext}. Ensure the dimension table is related in the semantic model.")

        # 4. Extract and check functions
        func_pattern = re.compile(r"\b([A-Z_]+)\s*\(")
        found_funcs = func_pattern.findall(expr.upper())
        used_functions = list(dict.fromkeys(found_funcs))  # preserve order, unique

        for fn in used_functions:
            if fn not in STANDARD_DAX_FUNCTIONS:
                warnings.append(
                    f"'{fn}' is not recognized as a standard DAX function. "
                    "Verify spelling or ensure it is a custom scalar/table construct."
                )

        # 5. Best practice warnings
        if "/" in expr and "DIVIDE" not in used_functions:
            warnings.append(
                "Consider using DIVIDE(numerator, denominator, [alternate_result]) instead of '/' "
                "to handle potential division by zero gracefully."
            )

        # 6. Complexity estimation
        complexity = "Standard"
        adv_funcs = {"CALCULATE", "CALCULATETABLE", "FILTER", "ALL", "ALLEXCEPT", "ALLSELECTED", "SAMEPERIODLASTYEAR", "DATEADD", "TOPN"}
        inter_funcs = {"SUMX", "AVERAGEX", "DIVIDE", "SWITCH", "RELATED", "SELECTEDVALUE"}

        if any(f in adv_funcs for f in used_functions) or "VAR " in expr.upper() or "RETURN " in expr.upper():
            complexity = "Advanced"
        elif any(f in inter_funcs for f in used_functions) or len(used_functions) >= 2:
            complexity = "Intermediate"

        return DAXValidationResult(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
            referenced_columns=referenced_columns,
            referenced_measures=referenced_measures,
            used_functions=used_functions,
            complexity=complexity,
        )
