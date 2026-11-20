import { describe, expect, it } from 'vitest'
import type { TaskPage } from '../repositories/taskRepository'
import type { Task } from '../types/task'
import { initialTasksState, selectTasks, selectTotal, tasksReducer } from './taskReducer'

function task(id: number, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: `Todo ${id}`,
    description: '',
    completed: false,
    priority: 'medium',
    category: 'Загальне',
    ...overrides,
  }
}

const firstPage: TaskPage = { tasks: [task(1), task(2), task(3)], total: 30, skip: 0, limit: 3 }

describe('tasksReducer', () => {
  const loaded = tasksReducer(initialTasksState, { type: 'fetchSuccess', page: firstPage })

  it('goes through loading, success and error states', () => {
    expect(initialTasksState.status).toBe('loading')
    expect(loaded.status).toBe('success')
    const failed = tasksReducer(loaded, { type: 'fetchError', error: 'boom' })
    expect(failed).toMatchObject({ status: 'error', error: 'boom' })
    expect(tasksReducer(failed, { type: 'fetchStart' })).toMatchObject({
      status: 'loading',
      error: null,
    })
  })

  it('shows a created task first and gives it a unique id', () => {
    const once = tasksReducer(loaded, { type: 'created', task: task(31, { title: 'New' }) })
    const twice = tasksReducer(once, { type: 'created', task: task(31, { title: 'Newer' }) })
    expect(selectTasks(twice).map((t) => t.id)).toEqual([32, 31, 1, 2, 3])
    expect(selectTotal(twice)).toBe(32)
  })

  it('keeps updates and deletions after the page is fetched again', () => {
    const updated = tasksReducer(loaded, { type: 'updated', task: task(2, { title: 'Edited' }) })
    const removed = tasksReducer(updated, { type: 'removed', id: 3 })
    const refetched = tasksReducer(removed, { type: 'fetchSuccess', page: firstPage })
    expect(selectTasks(refetched).map((t) => t.title)).toEqual(['Todo 1', 'Edited'])
    expect(selectTotal(refetched)).toBe(29)
  })
})
