const API_BASE = '/api/v1';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) return await res.json();
    const fallbackRes = await fetch('http://127.0.0.1:8000/health');
    return await fallbackRes.json();
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

export async function getDesktopEnvironment() {
  const res = await fetch(`${API_BASE}/powerbi/environment`);
  if (!res.ok) throw new Error('Failed to fetch desktop environment');
  return await res.json();
}

export async function getServiceStatus() {
  const res = await fetch(`${API_BASE}/powerbi/service/status`);
  if (!res.ok) throw new Error('Failed to fetch Power BI service status');
  return await res.json();
}

export async function uploadAndProcessPipeline(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/dataset/pipeline`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = 'Dataset upload/pipeline failed';
    if (typeof errData.detail === 'string') {
      msg = errData.detail;
    } else if (errData.detail?.message) {
      msg = errData.detail.message;
      if (errData.detail?.validation?.missing_columns?.length > 0) {
        msg += `: Missing required columns [${errData.detail.validation.missing_columns.join(', ')}]`;
      }
    }
    const error = new Error(msg);
    error.detail = errData.detail;
    throw error;
  }

  return await res.json();
}

export async function generateDashboardPlan(file, aiAssisted = false, prompt = '') {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  if (aiAssisted) params.append('ai_assisted', 'true');
  if (prompt) params.append('prompt', prompt);

  const res = await fetch(`${API_BASE}/dataset/plan?${params.toString()}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    let msg = 'Failed to generate dashboard plan';
    if (typeof errData.detail === 'string') {
      msg = errData.detail;
    } else if (errData.detail?.message) {
      msg = errData.detail.message;
    }
    const error = new Error(msg);
    error.detail = errData.detail;
    throw error;
  }

  return await res.json();
}

export async function generatePowerBIProject({ datasetId, customProjectName, aiAssisted = false, prompt = '', plan = null }) {
  const payload = {
    dataset_id: datasetId,
    custom_project_name: customProjectName || undefined,
    ai_assisted: aiAssisted,
    prompt: prompt || undefined,
    plan: plan || undefined,
  };

  const res = await fetch(`${API_BASE}/powerbi/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to generate Power BI project');
  }

  return await res.json();
}

export async function launchPowerBIDesktop(artifactId) {
  const res = await fetch(`${API_BASE}/powerbi/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifact_id: artifactId }),
  });

  return await res.json();
}

export function getDownloadUrl(artifactId) {
  return `${API_BASE}/powerbi/download/${artifactId}`;
}

export async function publishToService({ artifactId, workspaceId, targetReportName }) {
  const res = await fetch(`${API_BASE}/powerbi/service/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artifact_id: artifactId,
      workspace_id: workspaceId || undefined,
      target_report_name: targetReportName || undefined,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Service publishing failed');
  }

  return await res.json();
}

export async function sendChatMessage(datasetId, question) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, question }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Chat query failed');
  }

  return await res.json();
}

export async function getExecutiveReport(datasetId, datasetName = 'Campaign Performance') {
  const res = await fetch(`${API_BASE}/executive-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, dataset_name: datasetName }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to load executive report');
  }

  return await res.json();
}
