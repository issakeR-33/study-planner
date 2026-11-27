import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSession, setSession } from '../auth/session'
import { installFakeApi, TEST_TOKEN, TEST_USER, type FakeApi } from '../test/fakeApi'
import { taskRepository } from './taskRepository'

describe('taskRepository', () => {
  let api: FakeApi

  beforeEach(() => {
    api = installFakeApi()
    // mutation-запити потребують токена в сесії
    setSession({ user: TEST_USER, accessToken: TEST_TOKEN, refreshToken: 'refresh-1' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearSession()
  })

  it('maps a page of ApiTodo to Task with client-only defaults', async () => {
    const page = await taskRepository.getAll({ limit: 10, skip: 10 })
    expect(api.calls).toEqual(['GET /todos?limit=10&skip=10'])
    expect(page.total).toBe(25)
    expect(page.tasks[0]).toEqual({
      id: 11,
      title: 'Todo 11',
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Загальне',
      createdBy: 'user #1',
      createdAt: null,
    })
    // читання списку не потребує авторизації
    expect(api.authHeaders['GET /todos']).toBeNull()
  })

  it('reads one task by id', async () => {
    expect((await taskRepository.getById(3)).title).toBe('Todo 3')
  })

  it('creates a task with POST and keeps the client-only fields from the form', async () => {
    const task = await taskRepository.create(
      {
        title: ' Hooks ',
        description: 'useEffect',
        category: 'React',
        priority: 'high',
      },
      { id: 1, username: 'emilys' },
    )
    expect(api.calls).toEqual(['POST /todos/add'])
    expect(api.authHeaders['POST /todos/add']).toBe(`Bearer ${TEST_TOKEN}`)
    expect(task).toMatchObject({
      id: 26,
      title: 'Hooks',
      description: 'useEffect',
      priority: 'high',
      createdBy: 'emilys',
    })
    expect(task.createdAt).not.toBeNull()
  })

  it('updates with PUT and deletes with DELETE', async () => {
    await taskRepository.update(2, { title: 'Renamed', completed: true })
    await taskRepository.delete(2)
    expect(api.calls).toEqual(['PUT /todos/2', 'DELETE /todos/2'])
    expect(api.authHeaders['PUT /todos/2']).toBe(`Bearer ${TEST_TOKEN}`)
    expect(api.authHeaders['DELETE /todos/2']).toBe(`Bearer ${TEST_TOKEN}`)
    const putBody = JSON.parse((api.fetch.mock.calls[0]?.[1] as RequestInit).body as string)
    expect(putBody).toEqual({ todo: 'Renamed', completed: true })
  })
})
