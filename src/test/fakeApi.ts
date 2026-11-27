import { vi } from 'vitest'

interface FakeTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export interface FakeApi {
  todos: FakeTodo[]
  calls: string[]
  /** Заголовок Authorization кожного запиту: 'POST /todos/add' -> 'Bearer token-1'. */
  authHeaders: Record<string, string | null>
  /** Наступні запити з цим методом повертають 500. */
  failNext: (method: string, times?: number) => void
  fetch: ReturnType<typeof vi.fn>
}

export const TEST_USER = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: '',
}

export const TEST_TOKEN = 'token-1'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

// Фейковий DummyJSON у пам'яті. Як і справжній, mutation-запити лише відповідають,
// але нічого не зберігають.
export function installFakeApi(count = 25): FakeApi {
  const todos: FakeTodo[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    todo: `Todo ${i + 1}`,
    completed: i % 4 === 0,
    userId: 1,
  }))
  const calls: string[] = []
  const authHeaders: Record<string, string | null> = {}
  const failures = new Map<string, number>()

  const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input)
    const method = init?.method ?? 'GET'
    calls.push(`${method} ${url.pathname}${url.search}`)
    const authorization = new Headers(init?.headers).get('Authorization')
    authHeaders[`${method} ${url.pathname}`] = authorization

    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const left = failures.get(method) ?? 0
    if (left > 0) {
      failures.set(method, left - 1)
      return json({ message: 'Internal Server Error' }, 500)
    }

    const idMatch = url.pathname.match(/^\/todos\/(\d+)$/)
    const todo = idMatch ? todos.find((t) => t.id === Number(idMatch[1])) : undefined
    const body = init?.body ? JSON.parse(init.body as string) : {}

    if (method === 'POST' && url.pathname === '/auth/login') {
      return body.username === 'emilys' && body.password === 'emilyspass'
        ? json({ ...TEST_USER, accessToken: TEST_TOKEN, refreshToken: 'refresh-1' })
        : json({ message: 'Invalid credentials' }, 400)
    }
    if (method === 'GET' && url.pathname === '/auth/me') {
      return authorization === `Bearer ${TEST_TOKEN}`
        ? json(TEST_USER)
        : json({ message: 'Invalid/expired Token!' }, 401)
    }

    if (method === 'GET' && url.pathname === '/todos') {
      const limit = Number(url.searchParams.get('limit') ?? 30)
      const skip = Number(url.searchParams.get('skip') ?? 0)
      return json({ todos: todos.slice(skip, skip + limit), total: todos.length, skip, limit })
    }
    if (method === 'POST' && url.pathname === '/todos/add') {
      return json({ id: todos.length + 1, ...body }, 201)
    }
    if (idMatch && !todo) return json({ message: `Todo with id '${idMatch[1]}' not found` }, 404)
    if (method === 'GET' && todo) return json(todo)
    if (method === 'PUT' && todo) return json({ ...todo, ...body })
    if (method === 'DELETE' && todo) return json({ ...todo, isDeleted: true })
    return json({ message: 'Not found' }, 404)
  })

  vi.stubGlobal('fetch', fetchMock)

  return {
    todos,
    calls,
    authHeaders,
    failNext: (method, times = 1) => failures.set(method, times),
    fetch: fetchMock,
  }
}
