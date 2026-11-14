import { HealthResponse, ScenarioMeta, EvaluateResponse, RaceResponse, PolicyClause } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchScenarios(): Promise<ScenarioMeta[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  const data = await res.json();
  return data.scenarios;
}

export async function ingestScenario(scenarioId: string, customQuery?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, custom_query: customQuery }),
  });
  if (!res.ok) throw new Error('Ingestion failed');
  return res.json();
}

export async function evaluateSystemOne(scenarioId: string): Promise<EvaluateResponse> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
  if (!res.ok) throw new Error('Evaluation failed');
  return res.json();
}

export async function runApexRace(scenarioId: string, customQuery?: string): Promise<RaceResponse> {
  const res = await fetch(`${API_BASE}/race`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, custom_query: customQuery }),
  });
  if (!res.ok) throw new Error('Benchmark race failed');
  return res.json();
}

export async function groundClause(clauseId: string, documentName: string): Promise<any> {
  const res = await fetch(`${API_BASE}/ground`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clause_id: clauseId, document_name: documentName }),
  });
  if (!res.ok) throw new Error('Grounding request failed');
  return res.json();
}

export async function askCustomQuestion(
  questionText: string,
  scenarioId: string = 'dashcam_lane_violation',
  questionType: string = 'noul'
): Promise<any> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_text: questionText,
      scenario_id: scenarioId,
      question_type: questionType,
    }),
  });
  if (!res.ok) throw new Error('Custom question evaluation failed');
  return res.json();
}

export async function uploadVideoFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/video`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Video upload failed');
  return res.json();
}

export async function uploadPolicyFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/policy`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Policy upload failed');
  return res.json();
}

export async function fetchFullPolicy(): Promise<any> {
  const res = await fetch(`${API_BASE}/policy/full`);
  if (!res.ok) throw new Error('Failed to fetch full policy');
  return res.json();
}




