import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskDraft, TaskFilter } from '../types/task'
import { errorText } from '../utils/errors'
import { normalizeDraft } from '../utils/tasks'
import {
  TaskContext,
  type TaskContextValue,
  type ToastMessage,
  type ToastVariant,
} from './taskContext'

export const TOAST_DURATION_MS = 3000

interface TaskProviderProps {
  children: ReactNode
}

// Context лише роздає компонентам server state з useTasks і client/UI state,
// щоб не передавати їх через кілька рівнів props. Дані Task зберігаються в одному місці.
export function TaskProvider({ children }: TaskProviderProps) {
  const {
    tasks,
    status,
    error,
    total,
    page,
    totalPages,
    goToPage,
    reload,
    isLocal,
    create,
    update,
    toggle,
    remove,
  } = useTasks()

  // у localStorage лише client/UI state: активний фільтр, а не самі завдання
  const [filter, setFilter] = useLocalStorage<TaskFilter>('study-planner:filter', 'all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((text: string, variant: ToastVariant = 'success') => {
    setToast({ id: Date.now(), text, variant })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // заголовок вкладки показує кількість невиконаних завдань на сторінці
  useEffect(() => {
    const active = tasks.filter((task) => !task.completed).length
    document.title = `Study Planner — ${active} active ${active === 1 ? 'task' : 'tasks'}`
  }, [tasks])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  // спільна обгортка для mutation: success або error toast і результат для форми
  const run = useCallback(
    async (action: () => Promise<void>, success: string, failure: string) => {
      try {
        await action()
        if (success) showToast(success)
        return true
      } catch (e) {
        showToast(`${failure}: ${errorText(e)}`, 'error')
        return false
      }
    },
    [showToast],
  )

  const createTask = useCallback(
    (draft: TaskDraft) => run(() => create(draft), 'Завдання створено', 'Не вдалося створити'),
    [run, create],
  )

  const updateTask = useCallback(
    (task: Task, draft: TaskDraft) => {
      const next: Task = { ...task, ...normalizeDraft(draft) }
      return run(
        () => update(next, { title: next.title }),
        'Зміни збережено',
        'Не вдалося зберегти',
      )
    },
    [run, update],
  )

  const toggleTask = useCallback(
    (task: Task) => run(() => toggle(task), '', 'Не вдалося змінити стан'),
    [run, toggle],
  )

  const deleteTask = useCallback(
    (task: Task) => {
      const result = run(() => remove(task.id), 'Завдання видалено', 'Не вдалося видалити')
      setSelectedId((id) => (id === task.id ? null : id))
      return result
    },
    [run, remove],
  )

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      status,
      error,
      total,
      page,
      totalPages,
      goToPage,
      reload,
      filter,
      setFilter,
      selectedId,
      openDetails: setSelectedId,
      closeDetails: () => setSelectedId(null),
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      isLocalTask: isLocal,
      toast,
      dismissToast,
    }),
    [
      tasks,
      status,
      error,
      total,
      page,
      totalPages,
      goToPage,
      reload,
      filter,
      setFilter,
      selectedId,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      isLocal,
      toast,
      dismissToast,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
