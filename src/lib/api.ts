// Simple API helper with mock fallback
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function apiRequest<T>(path: string, options: { method?: HttpMethod; body?: any; query?: Record<string, any> } = {}): Promise<T> {
  const qs = options.query ? `?${new URLSearchParams(Object.entries(options.query).reduce((acc, [k, v]) => {
    if (v === undefined || v === null) return acc
    acc[k] = String(v)
    return acc
  }, {} as Record<string, string>)).toString()}` : ''
  const url = `${API_BASE_URL}${path}${qs}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  const json = await response.json()
  // Unwrap backend ApiResponse { success, data, ... } if present
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  return json as T
}

// Helpers with mock fallbacks
export async function getWithMock<T>(path: string, mock: T, query?: Record<string, any>): Promise<T> {
  try {
    return await apiRequest<T>(path, { query })
  } catch {
    return mock
  }
}

export async function postWithMock<T>(path: string, body: any, mock: T): Promise<T> {
  try {
    return await apiRequest<T>(path, { method: 'POST', body })
  } catch {
    return mock
  }
}


