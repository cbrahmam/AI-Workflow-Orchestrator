const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function listWorkflows() {
  return request('/workflows')
}

export function getWorkflow(id) {
  return request(`/workflows/${id}`)
}

export function createWorkflow(data) {
  return request('/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateWorkflow(id, data) {
  return request(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWorkflow(id) {
  return request(`/workflows/${id}`, { method: 'DELETE' })
}

export function duplicateWorkflow(id) {
  return request(`/workflows/${id}/duplicate`, { method: 'POST' })
}

export function executeWorkflow(workflowId, input = null) {
  return request(`/workflows/${workflowId}/execute`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  })
}

export function getExecution(executionId) {
  return request(`/executions/${executionId}`)
}

export function cancelExecution(executionId) {
  return request(`/executions/${executionId}/cancel`, { method: 'POST' })
}

export function listExecutions(workflowId) {
  return request(`/workflows/${workflowId}/executions`)
}

export function listTemplates() {
  return request('/templates')
}

export function getTemplate(id) {
  return request(`/templates/${id}`)
}

export function useTemplate(id) {
  return request(`/templates/${id}/use`, { method: 'POST' })
}

export function listCommunityTemplates() {
  return request('/templates/community')
}

export function listPlugins() {
  return request('/plugins')
}

export function listSchedules() {
  return request('/schedules')
}

export function createSchedule(data) {
  return request('/schedules', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteSchedule(id) {
  return request(`/schedules/${id}`, { method: 'DELETE' })
}

export function toggleSchedule(id) {
  return request(`/schedules/${id}/toggle`, { method: 'POST' })
}
