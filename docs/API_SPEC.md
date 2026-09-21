# API Specification

## Local base URL
`http://127.0.0.1:8000`

## Health
`GET /`

## Initial generation endpoint
`POST /generate-dashboard`
- Content type: multipart/form-data
- Field: `file`
- Supported: CSV, XLSX

Example response:
```json
{
  "status": "success",
  "dataset": {},
  "validation": {},
  "kpis": {},
  "dashboard_plan": {}
}
```

## Future asynchronous generation
`POST /api/v1/generation`
```json
{"job_id":"job_123","status":"queued"}
```

`GET /api/v1/generation/{job_id}`

## Future chat
`POST /api/v1/chat`
```json
{
  "dataset_id": "dataset_123",
  "question": "Which channel had the best ROI for 30-day campaigns?"
}
```

Response:
```json
{
  "answer": "...",
  "evidence": [],
  "tools_used": ["analyze_channels"]
}
```

## Rules
- Version public APIs under `/api/v1`.
- Use Pydantic request/response models.
- Use consistent errors.
- Never expose credentials or unnecessary filesystem paths.
