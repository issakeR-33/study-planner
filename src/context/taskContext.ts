import { createContext } from 'react'
import type { RequestStatus } from '../reducers/taskReducer'
import type { Task, TaskDraft } from '../types/task'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  text: string
  variant: ToastVariant
}

export interface TaskContextValue {
  // server state (дані з API, ними керує useTasks)
  tasks: Task[]
  status: RequestStatus
  error: string | null
  total: number
  totalPages: number
  loadPage: (page: number, signal: AbortSignal) => Promise<void>
  findTask: (id: number) => Task | undefined
  isDeleted: (id: number) => boolean
  isLocalTask: (id: number) => boolean
  withLocalChanges: (task: Task) => Task
  // дії; лише для авторизованого користувача, кожна повертає true при успіху
  createTask: (draft: TaskDraft) => Promise<boolean>
  updateTask: (task: Task, draft: TaskDraft) => Promise<boolean>
  toggleTask: (task: Task) => Promise<boolean>
  deleteTask: (task: Task) => Promise<boolean>
  toast: ToastMessage | null
  showToast: (text: string, variant?: ToastVariant) => void
  dismissToast: () => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
