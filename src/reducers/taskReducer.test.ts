import { describe, expect, it } from 'vitest'
import { initialTasks } from '../data/initialTasks'
import { createInitialState, taskReducer, type TasksState } from './taskReducer'

const draft = { title: 'Hooks', description: '', category: 'React', priority: 'low' as const }

function ids(state: TasksState) {
  return state.tasks.map((task) => task.id)
}

describe('taskReducer', () => {
  const start = createInitialState()

  it('adds, toggles and updates tasks without mutating the previous state', () => {
    const added = taskReducer(start, { type: 'add', draft })
    expect(ids(added)).toEqual([1, 2, 3, 4, 5])
    expect(start.tasks).toBe(initialTasks)

    const toggled = taskReducer(added, { type: 'toggle', id: 5 })
    expect(toggled.tasks[4]?.completed).toBe(true)
    expect(added.tasks[4]?.completed).toBe(false)

    const updated = taskReducer(toggled, {
      type: 'update',
      id: 5,
      draft: { ...draft, title: '  useEffect ', priority: 'high' },
    })
    expect(updated.tasks[4]).toMatchObject({
      title: 'useEffect',
      priority: 'high',
      completed: true,
    })
  })

  it('keeps a task until confirmDelete and restores it on undoDelete', () => {
    const pending = taskReducer(start, { type: 'requestDelete', id: 1 })
    expect(pending.pendingDelete).toEqual({ ids: [1], kind: 'single' })
    expect(ids(pending)).toContain(1)

    expect(ids(taskReducer(pending, { type: 'confirmDelete' }))).toEqual([2, 3, 4])

    const undone = taskReducer(pending, { type: 'undoDelete' })
    expect(undone.pendingDelete).toBeNull()
    expect(ids(undone)).toEqual([1, 2, 3, 4])
  })

  it('finishes the previous pending delete when a new one starts', () => {
    const first = taskReducer(start, { type: 'requestDelete', id: 1 })
    const second = taskReducer(first, { type: 'requestDelete', id: 3 })
    expect(ids(second)).toEqual([2, 3, 4])
    expect(second.pendingDelete?.ids).toEqual([3])
  })

  it('clears completed tasks through the same undo flow', () => {
    const pending = taskReducer(start, { type: 'clearCompleted' })
    expect(pending.pendingDelete).toEqual({ ids: [2], kind: 'completed' })
    expect(ids(taskReducer(pending, { type: 'confirmDelete' }))).toEqual([1, 3, 4])
  })

  it('resets to the initial data', () => {
    const changed = taskReducer(taskReducer(start, { type: 'add', draft }), {
      type: 'requestDelete',
      id: 1,
    })
    expect(taskReducer(changed, { type: 'reset' })).toEqual(createInitialState())
  })
})
