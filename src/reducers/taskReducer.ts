import type { TaskPage } from '../repositories/taskRepository'
import type { Task } from '../types/task'

export type RequestStatus = 'loading' | 'success' | 'error'

/**
 * Зміни, які DummyJSON лише імітує. Після успішної mutation-відповіді сервер нічого не
 * зберігає, тому клієнт сам пам'ятає їх у межах сесії й накладає на кожну отриману сторінку.
 */
export interface LocalChanges {
  created: Task[]
  updated: Record<number, Task>
  deletedIds: number[]
}

// Server state списку: остання сторінка з API, стан запиту і локальні зміни поверх неї
export interface TasksState {
  status: RequestStatus
  page: TaskPage | null
  error: string | null
  changes: LocalChanges
}

export type TasksAction =
  | { type: 'fetchStart' }
  | { type: 'fetchSuccess'; page: TaskPage }
  | { type: 'fetchError'; error: string }
  | { type: 'created'; task: Task }
  | { type: 'updated'; task: Task }
  | { type: 'removed'; id: number }

export const initialTasksState: TasksState = {
  status: 'loading',
  page: null,
  error: null,
  changes: { created: [], updated: {}, deletedIds: [] },
}

export function isLocalTask(state: TasksState, id: number): boolean {
  return state.changes.created.some((task) => task.id === id)
}

// API щоразу повертає для нового завдання той самий id (total + 1), тож робимо його унікальним
function uniqueId(state: TasksState, apiId: number): number {
  const taken = [
    ...(state.page?.tasks.map((task) => task.id) ?? []),
    ...state.changes.created.map((task) => task.id),
    state.page?.total ?? 0,
  ]
  return Math.max(apiId, ...taken.map((id) => id + 1))
}

// Чиста функція: лише обчислює новий state, без запитів і побічних ефектів
export function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case 'fetchStart':
      return { ...state, status: 'loading', error: null }

    case 'fetchSuccess':
      return { ...state, status: 'success', page: action.page, error: null }

    case 'fetchError':
      return { ...state, status: 'error', error: action.error }

    case 'created': {
      const task = { ...action.task, id: uniqueId(state, action.task.id) }
      return { ...state, changes: { ...state.changes, created: [task, ...state.changes.created] } }
    }

    case 'updated': {
      const { task } = action
      const { changes } = state
      return isLocalTask(state, task.id)
        ? {
            ...state,
            changes: {
              ...changes,
              created: changes.created.map((item) => (item.id === task.id ? task : item)),
            },
          }
        : { ...state, changes: { ...changes, updated: { ...changes.updated, [task.id]: task } } }
    }

    case 'removed': {
      const { changes } = state
      return isLocalTask(state, action.id)
        ? {
            ...state,
            changes: {
              ...changes,
              created: changes.created.filter((task) => task.id !== action.id),
            },
          }
        : { ...state, changes: { ...changes, deletedIds: [...changes.deletedIds, action.id] } }
    }
  }
}

// Derived state: завдання поточної сторінки з урахуванням локальних змін.
// Нові завдання показуються першими на першій сторінці.
export function selectTasks(state: TasksState): Task[] {
  if (!state.page) return []
  const { created, updated, deletedIds } = state.changes
  const fromApi = state.page.tasks
    .filter((task) => !deletedIds.includes(task.id))
    .map((task) => updated[task.id] ?? task)
  return state.page.skip === 0 ? [...created, ...fromApi] : fromApi
}

export function selectTotal(state: TasksState): number {
  if (!state.page) return 0
  const { created, deletedIds } = state.changes
  return Math.max(0, state.page.total + created.length - deletedIds.length)
}
