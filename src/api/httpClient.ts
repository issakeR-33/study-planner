// API layer: єдине місце, яке знає про fetch, базову адресу, заголовки й HTTP-статуси.
// Компоненти й repository отримують або дані, або HttpError.

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  /** Сигнал AbortController для скасування запиту. */
  signal?: AbortSignal
  query?: Record<string, string | number | undefined>
}

// Скасований запит - не помилка для користувача, тому його легко відрізнити
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  if (!API_URL) {
    throw new HttpError(0, 'VITE_API_URL не задано: скопіюйте .env.example у .env')
  }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value))
  }
  const search = params.toString()
  return `${API_URL}${path}${search ? `?${search}` : ''}`
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // тіло відповіді не JSON
  }
  return `HTTP ${response.status}: ${response.statusText || 'помилка запиту'}`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, query } = options
  const url = buildUrl(path, query)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    // AbortError передаємо як є, решта означає, що сервер недоступний
    if (isAbortError(error)) throw error
    throw new HttpError(0, 'Немає з’єднання з сервером')
  }

  if (!response.ok) {
    throw new HttpError(response.status, await errorMessage(response))
  }
  return (await response.json()) as T
}
