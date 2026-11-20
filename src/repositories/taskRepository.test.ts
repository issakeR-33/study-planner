import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFakeApi, type FakeApi } from '../test/fakeApi'
import { taskRepository } from './taskRepository'

describe('taskRepository', () => {
  let api: FakeApi

  beforeEach(() => {
    api = installFakeApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
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
    })
  })

  it('reads one task by id', async () => {
    expect((await taskRepository.getById(3)).title).toBe('Todo 3')
  })

  it('creates a task with POST and keeps the client-only fields from the form', async () => {
    const task = await taskRepository.create({
      title: ' Hooks ',
      description: 'useEffect',
      category: 'React',
      priority: 'high',
    })
    expect(api.calls).toEqual(['POST /todos/add'])
    expect(task).toMatchObject({
      id: 26,
      title: 'Hooks',
      description: 'useEffect',
      priority: 'high',
    })
  })

  it('updates with PUT and deletes with DELETE', async () => {
    await taskRepository.update(2, { title: 'Renamed', completed: true })
    await taskRepository.delete(2)
    expect(api.calls).toEqual(['PUT /todos/2', 'DELETE /todos/2'])
    const putBody = JSON.parse((api.fetch.mock.calls[0]?.[1] as RequestInit).body as string)
    expect(putBody).toEqual({ todo: 'Renamed', completed: true })
  })
})
