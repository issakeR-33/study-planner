import { initialTasks } from '../data/initialTasks'
import type { Task, TaskDraft } from '../types/task'
import { createTask, normalizeDraft } from '../utils/tasks'

/** Заплановане видалення: одне завдання або всі виконані (власний undo-flow для «Очистити виконані»). */
export interface PendingDelete {
  ids: number[]
  kind: 'single' | 'completed'
}

export interface TasksState {
  tasks: Task[]
  pendingDelete: PendingDelete | null
}

export type TaskAction =
  | { type: 'add'; draft: TaskDraft }
  | { type: 'toggle'; id: number }
  | { type: 'update'; id: number; draft: TaskDraft }
  | { type: 'requestDelete'; id: number }
  | { type: 'confirmDelete' }
  | { type: 'undoDelete' }
  | { type: 'clearCompleted' }
  | { type: 'reset' }

export function createInitialState(tasks: Task[] = initialTasks): TasksState {
  return { tasks, pendingDelete: null }
}

function withoutIds(tasks: Task[], ids: readonly number[]): Task[] {
  return tasks.filter((task) => !ids.includes(task.id))
}

// Попереднє заплановане видалення завершується, щойно запускається нове:
// одночасно активне лише одне Undoable Delete.
function startPending(state: TasksState, pending: PendingDelete): TasksState {
  const tasks = state.pendingDelete ? withoutIds(state.tasks, state.pendingDelete.ids) : state.tasks
  return { tasks, pendingDelete: pending }
}

// Чиста функція: лише обчислює новий state, без таймерів, localStorage і DOM.
export function taskReducer(state: TasksState, action: TaskAction): TasksState {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [...state.tasks, createTask(state.tasks, action.draft)] }

    case 'toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed: !task.completed } : task,
        ),
      }

    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, ...normalizeDraft(action.draft) } : task,
        ),
      }

    case 'requestDelete':
      if (!state.tasks.some((task) => task.id === action.id)) return state
      return startPending(state, { ids: [action.id], kind: 'single' })

    case 'clearCompleted': {
      const ids = state.tasks.filter((task) => task.completed).map((task) => task.id)
      if (ids.length === 0) return state
      return startPending(state, { ids, kind: 'completed' })
    }

    case 'confirmDelete':
      if (!state.pendingDelete) return state
      return { tasks: withoutIds(state.tasks, state.pendingDelete.ids), pendingDelete: null }

    case 'undoDelete':
      return { ...state, pendingDelete: null }

    case 'reset':
      return createInitialState()
  }
}
