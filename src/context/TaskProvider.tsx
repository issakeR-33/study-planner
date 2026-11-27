import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSession } from '../auth/session'
import { useTasks } from '../hooks/useTasks'
import type { Task, TaskDraft } from '../types/task'
import { errorText, NotAuthenticatedError } from '../utils/errors'
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

// Context роздає компонентам server state з useTasks і сповіщення.
// Дані Task зберігаються в одному місці, тож зміни видно і в списку, і в деталях.
export function TaskProvider({ children }: TaskProviderProps) {
  const {
    tasks,
    status,
    error,
    total,
    totalPages,
    loadPage,
    isLocal,
    findTask,
    isDeleted,
    withLocalChanges,
    create,
    update,
    toggle,
    remove,
  } = useTasks()

  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((text: string, variant: ToastVariant = 'success') => {
    setToast({ id: Date.now(), text, variant })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // заголовок вкладки показує кількість невиконаних завдань на завантаженій сторінці
  useEffect(() => {
    if (status !== 'success') return
    const active = tasks.filter((task) => !task.completed).length
    document.title = `Study Planner — ${active} active ${active === 1 ? 'task' : 'tasks'}`
  }, [tasks, status])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  // Authorization: перед кожною зміною даних перевіряємо сесію, а не лише ховаємо кнопки
  const run = useCallback(
    async (action: () => Promise<void>, success: string, failure: string) => {
      try {
        if (!getSession()) throw new NotAuthenticatedError()
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
    (draft: TaskDraft) =>
      run(
        async () => {
          const user = getSession()?.user
          if (!user) throw new NotAuthenticatedError()
          await create(draft, { id: user.id, username: user.username })
        },
        'Завдання створено',
        'Не вдалося створити',
      ),
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
    (task: Task) => run(() => remove(task.id), 'Завдання видалено', 'Не вдалося видалити'),
    [run, remove],
  )

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      status,
      error,
      total,
      totalPages,
      loadPage,
      findTask,
      isDeleted,
      isLocalTask: isLocal,
      withLocalChanges,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      toast,
      showToast,
      dismissToast,
    }),
    [
      tasks,
      status,
      error,
      total,
      totalPages,
      loadPage,
      findTask,
      isDeleted,
      isLocal,
      withLocalChanges,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
      toast,
      showToast,
      dismissToast,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
