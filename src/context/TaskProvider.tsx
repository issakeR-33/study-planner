import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createInitialState, taskReducer } from '../reducers/taskReducer'
import type { TaskDraft, TaskFilter } from '../types/task'
import { loadTasks, TASKS_STORAGE_KEY } from '../utils/storage'
import {
  TaskContext,
  type TaskContextValue,
  type ToastMessage,
  type ToastVariant,
} from './taskContext'

export const UNDO_DELAY_MS = 5000
export const TOAST_DURATION_MS = 3000

interface TaskProviderProps {
  children: ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  // reducer - єдине джерело правди для tasks; початковий стан читається з localStorage один раз
  const [state, dispatch] = useReducer(taskReducer, undefined, () =>
    createInitialState(loadTasks()),
  )
  const { tasks, pendingDelete } = state

  // активний фільтр зберігається окремо через власний hook
  const [filter, setFilter] = useLocalStorage<TaskFilter>('study-planner:filter', 'all')

  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((text: string, variant: ToastVariant = 'success') => {
    setToast({ id: Date.now(), text, variant })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // синхронізація tasks з localStorage після кожної зміни
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // сховище може бути недоступне (приватний режим, переповнення): дані лишаються в пам'яті
    }
  }, [tasks])

  // заголовок вкладки показує кількість невиконаних завдань
  useEffect(() => {
    const active = tasks.filter((task) => !task.completed).length
    document.title = `Study Planner — ${active} active ${active === 1 ? 'task' : 'tasks'}`
  }, [tasks])

  // Undoable Delete: таймер живе в effect, а не в reducer. Нове заплановане видалення
  // або Undo змінює pendingDelete, і cleanup скасовує попередній таймер.
  useEffect(() => {
    if (!pendingDelete) return
    const timer = setTimeout(() => {
      dispatch({ type: 'confirmDelete' })
      showToast(
        pendingDelete.kind === 'completed' ? 'Виконані завдання видалено' : 'Завдання видалено',
      )
    }, UNDO_DELAY_MS)
    return () => clearTimeout(timer)
  }, [pendingDelete, showToast])

  // звичайне сповіщення зникає саме
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const addTask = useCallback(
    (draft: TaskDraft) => {
      dispatch({ type: 'add', draft })
      showToast('Завдання додано')
    },
    [showToast],
  )

  const updateTask = useCallback(
    (id: number, draft: TaskDraft) => {
      if (pendingDelete?.ids.includes(id)) {
        showToast('Завдання вже заплановано до видалення', 'error')
        return
      }
      dispatch({ type: 'update', id, draft })
      showToast('Зміни збережено')
    },
    [pendingDelete, showToast],
  )

  const toggleTask = useCallback((id: number) => dispatch({ type: 'toggle', id }), [])

  const requestDelete = useCallback((id: number) => dispatch({ type: 'requestDelete', id }), [])

  const undoDelete = useCallback(() => {
    dispatch({ type: 'undoDelete' })
    showToast('Видалення скасовано', 'info')
  }, [showToast])

  const clearCompleted = useCallback(() => {
    if (!tasks.some((task) => task.completed)) {
      showToast('Немає виконаних завдань для очищення', 'error')
      return
    }
    dispatch({ type: 'clearCompleted' })
  }, [tasks, showToast])

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset' })
    setFilter('all')
    showToast('Дані скинуто до початкових', 'info')
  }, [setFilter, showToast])

  // value створюється заново лише тоді, коли змінюється щось, що в ньому лежить
  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      filter,
      setFilter,
      pendingDelete,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      clearCompleted,
      resetTasks,
      toast,
      dismissToast,
    }),
    [
      tasks,
      filter,
      setFilter,
      pendingDelete,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      clearCompleted,
      resetTasks,
      toast,
      dismissToast,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
