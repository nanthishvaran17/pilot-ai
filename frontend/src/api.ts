import {
  Project, QuestionnaireState, LiveRequirementsSummary,
  Blueprint, ExportJob, IdeaAnalysisResponse, Requirement
} from './types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Projects
  getProjects: () => fetchJson<Project[]>('/projects'),
  getProject: (id: string) => fetchJson<Project>(`/projects/${id}`),
  createProject: (data: { name: string; raw_idea?: string; target_audience?: string; template_id?: string; mode?: string; depth?: string }) =>
    fetchJson<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) =>
    fetchJson<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  duplicateProject: (id: string) =>
    fetchJson<Project>(`/projects/${id}/duplicate`, { method: 'POST' }),
  deleteProject: (id: string) =>
    fetchJson<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  // Idea Analysis
  analyzeIdea: (description: string) =>
    fetchJson<IdeaAnalysisResponse>('/projects/analyze-idea', {
      method: 'POST',
      body: JSON.stringify({ description })
    }),

  // Questionnaire
  getQuestionnaireState: (projectId: string) =>
    fetchJson<QuestionnaireState>(`/questions/state/${projectId}`),
  autosaveResponse: (projectId: string, data: { question_key: string; value: any; is_confirmed?: boolean; is_inferred?: boolean; is_skipped?: boolean; is_undecided?: boolean }) =>
    fetchJson<QuestionnaireState>(`/questions/autosave/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Live Requirements Summary & MoSCoW
  getLiveSummary: (projectId: string) =>
    fetchJson<LiveRequirementsSummary>(`/projects/${projectId}/summary`),
  getRequirements: (projectId: string) =>
    fetchJson<Requirement[]>(`/projects/${projectId}/requirements`),
  createRequirement: (projectId: string, data: Partial<Requirement>) =>
    fetchJson<Requirement>(`/projects/${projectId}/requirements`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateRequirement: (projectId: string, reqId: string, data: Partial<Requirement>) =>
    fetchJson<Requirement>(`/projects/${projectId}/requirements/${reqId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteRequirement: (projectId: string, reqId: string) =>
    fetchJson<{ message: string }>(`/projects/${projectId}/requirements/${reqId}`, {
      method: 'DELETE'
    }),

  // Blueprint & Exports
  getBlueprint: (projectId: string) =>
    fetchJson<Blueprint>(`/blueprint/${projectId}`),
  generateBlueprint: (projectId: string) =>
    fetchJson<Blueprint>(`/blueprint/${projectId}/generate`, { method: 'POST' }),
  exportBlueprint: (projectId: string, format: string) =>
    fetchJson<ExportJob>(`/blueprint/${projectId}/export`, {
      method: 'POST',
      body: JSON.stringify({ export_format: format })
    }),
  getExportHistory: (projectId: string) =>
    fetchJson<ExportJob[]>(`/blueprint/${projectId}/exports`),
  getDownloadUrl: (jobId: string) => `${API_BASE}/blueprint/download/${jobId}`,

  // Admin
  getTemplates: () => fetchJson<any[]>('/admin/templates'),
  getStats: () => fetchJson<any>('/admin/stats'),
  getAuditLogs: () => fetchJson<any[]>('/admin/audit-logs'),
};
