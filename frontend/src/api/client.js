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
