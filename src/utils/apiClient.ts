// Thin wrapper around fetch. Domain clients never call fetch directly: they go through Client.ts.
export interface RequestConfig {
  data?: object
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

export class ApiError extends Error {
  response?: { status: number; data: unknown }

  constructor(message: string, response?: { status: number; data: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.response = response
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Sent on every request so the (mock) server knows who is calling.
let userId: string | null = null
export const bindToUser = (id: string | null) => {
  userId = id
}

export const isCancel = (error: unknown) => error instanceof Error && error.name === 'AbortError'

const request = async <T>(
  method: Method,
  url: string,
  { data, params, signal }: RequestConfig = {},
): Promise<ApiResponse<T>> => {
  const target = new URL(url, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) target.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (data) headers['Content-Type'] = 'application/json'
  if (userId) headers['x-demo-user'] = userId

  let response: Response
  try {
    response = await fetch(target.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal,
    })
  } catch (error) {
    if (isCancel(error)) throw error
    throw new ApiError('Request failed with no response')
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, {
      status: response.status,
      data: body,
    })
  }
  return { data: body as T, status: response.status, headers: response.headers }
}

export const get = <T>(url: string, config?: RequestConfig) => request<T>('GET', url, config)
export const post = <T>(url: string, config?: RequestConfig) => request<T>('POST', url, config)
export const put = <T>(url: string, config?: RequestConfig) => request<T>('PUT', url, config)
export const patch = <T>(url: string, config?: RequestConfig) => request<T>('PATCH', url, config)
export const del = <T>(url: string, config?: RequestConfig) => request<T>('DELETE', url, config)
