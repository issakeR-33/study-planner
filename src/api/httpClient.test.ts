import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearSession, getSession, setSession } from '../auth/session'
import { HttpError, isAbortError, request } from './httpClient'

afterEach(() => {
  vi.unstubAllGlobals()
  clearSession()
})

describe('httpClient', () => {
  it('builds the URL from VITE_API_URL and the query and sends JSON', async () => {
    const fetchMock = vi.fn(async () => new Response('{"ok":true}'))
    vi.stubGlobal('fetch', fetchMock)
    await request('/todos/add', { method: 'POST', body: { todo: 'x' }, query: { limit: 10 } })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/todos/add?limit=10')
    expect(init.method).toBe('POST')
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
    expect(init.body).toBe('{"todo":"x"}')
  })

  it('throws HttpError with the server message when response.ok is false', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response('{"message":"Todo not found"}', { status: 404 }),
    )
    await expect(request('/todos/999')).rejects.toEqual(new HttpError(404, 'Todo not found'))
  })

  it('turns a network failure into HttpError with status 0', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(request('/todos')).rejects.toMatchObject({ status: 0 })
  })

  it('passes an AbortError through so the UI can ignore it', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new DOMException('Aborted', 'AbortError')
    })
    const error = await request('/todos').catch((e: unknown) => e)
    expect(isAbortError(error)).toBe(true)
  })

  it('adds Authorization: Bearer only for auth requests', async () => {
    const fetchMock = vi.fn(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetchMock)
    setSession({
      user: { id: 1, username: 'emilys', email: '', firstName: '', lastName: '' },
      accessToken: 'abc',
      refreshToken: 'r',
    })
    await request('/todos')
    await request('/todos/1', { method: 'DELETE', auth: true })
    const header = (index: number) =>
      new Headers((fetchMock.mock.calls[index] as unknown as [string, RequestInit])[1].headers).get(
        'Authorization',
      )
    expect(header(0)).toBeNull()
    expect(header(1)).toBe('Bearer abc')
  })

  it('refuses an auth request without a session and ends the session on 401', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response('{"message":"Token Expired!"}', { status: 401 }),
    )
    await expect(request('/auth/me', { auth: true })).rejects.toMatchObject({ status: 401 })
    setSession({
      user: { id: 1, username: 'emilys', email: '', firstName: '', lastName: '' },
      accessToken: 'old',
      refreshToken: 'r',
    })
    await expect(request('/auth/me', { auth: true })).rejects.toEqual(
      new HttpError(401, 'Token Expired!'),
    )
    expect(getSession()).toBeNull()
  })
})
