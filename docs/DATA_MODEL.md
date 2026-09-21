# Data Model and Analytical Model

## Source table: Campaigns
| Field | Role |
|---|---|
| Campaign_ID | Identifier |
| Company | Dimension |
| Campaign_Type | Dimension |
| Target_Audience | Dimension |
| Duration | Dimension/measure candidate |
| Channel_Used | Dimension |
| Conversion_Rate | Numeric measure |
| Acquisition_Cost | Numeric measure |
| ROI | Numeric measure |
| Location | Geography dimension |

## Validation
Campaign_ID should identify campaigns. Conversion_Rate, Acquisition_Cost, and ROI should be numeric. Duration may require normalization when represented as text such as `30 days`.

## Derived fields
Potential fields:
- Duration_Days
- Acquisition_Cost_Band
- ROI_Band
- Conversion_Rate_Band
- Performance_Score

Derived fields must be documented before implementation.

## KPI definitions
- Total Campaigns = distinct Campaign_ID
- Average ROI = mean ROI
- Average Conversion Rate = mean Conversion_Rate
- Average Acquisition Cost = mean Acquisition_Cost

Do not silently replace averages with weighted metrics.

## Ranking score
The combined KPI score must be configurable. Do not embed arbitrary weights without documenting them.
