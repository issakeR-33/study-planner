import { createContext } from 'react'
import type { PendingDelete } from '../reducers/taskReducer'
import type { Task, TaskDraft, TaskFilter } from '../types/task'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  text: string
  variant: ToastVariant
}

export interface TaskContextValue {
  tasks: Task[]
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  pendingDelete: PendingDelete | null
  addTask: (draft: TaskDraft) => void
  updateTask: (id: number, draft: TaskDraft) => void
  toggleTask: (id: number) => void
  requestDelete: (id: number) => void
  undoDelete: () => void
  clearCompleted: () => void
  resetTasks: () => void
  toast: ToastMessage | null
  dismissToast: () => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
