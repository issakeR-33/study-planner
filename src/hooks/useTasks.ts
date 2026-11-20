import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { isAbortError } from '../api/httpClient'
import {
  initialTasksState,
  isLocalTask,
  selectTasks,
  selectTotal,
  tasksReducer,
} from '../reducers/taskReducer'
import { taskRepository, type TaskPatch } from '../repositories/taskRepository'
import type { Task, TaskDraft } from '../types/task'
import { errorText } from '../utils/errors'

export const PAGE_SIZE = 10

// Server state списку завдань: завантаження сторінки, пагінація й CRUD через repository
export function useTasks() {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState)
  // поточна сторінка - client/UI state
  const [page, setPage] = useState(1)
  // збільшення ключа повторює запит тієї самої сторінки
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // новий запит скасовує попередній через cleanup
    const controller = new AbortController()
    taskRepository
      .getAll({ limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, signal: controller.signal })
      .then((result) => dispatch({ type: 'fetchSuccess', page: result }))
      .catch((error: unknown) => {
        // скасований запит не є помилкою для користувача
        if (!isAbortError(error)) dispatch({ type: 'fetchError', error: errorText(error) })
      })
    return () => controller.abort()
  }, [page, reloadKey])

  // derived state перераховується лише при зміні server state
  const tasks = useMemo(() => selectTasks(state), [state])
  const total = selectTotal(state)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const goToPage = useCallback((next: number) => {
    dispatch({ type: 'fetchStart' })
    setPage(next)
  }, [])

  const reload = useCallback(() => {
    dispatch({ type: 'fetchStart' })
    setReloadKey((key) => key + 1)
  }, [])

  const isLocal = useCallback((id: number) => isLocalTask(state, id), [state])

  const create = useCallback(async (draft: TaskDraft) => {
    const task = await taskRepository.create(draft)
    dispatch({ type: 'created', task })
  }, [])

  // Створені на клієнті завдання на сервері не існують (DummyJSON їх не зберіг),
  // тому для них запит не відправляється, змінюється лише локальний стан.
  const update = useCallback(
    async (task: Task, patch: TaskPatch) => {
      if (!isLocal(task.id)) await taskRepository.update(task.id, patch)
      dispatch({ type: 'updated', task })
    },
    [isLocal],
  )

  // optimistic update: інтерфейс змінюється одразу, а при помилці повертається назад
  const toggle = useCallback(
    async (task: Task) => {
      const toggled = { ...task, completed: !task.completed }
      dispatch({ type: 'updated', task: toggled })
      if (isLocal(task.id)) return
      try {
        await taskRepository.update(task.id, { completed: toggled.completed })
      } catch (error) {
        dispatch({ type: 'updated', task })
        throw error
      }
    },
    [isLocal],
  )

  const remove = useCallback(
    async (id: number) => {
      if (!isLocal(id)) await taskRepository.delete(id)
      dispatch({ type: 'removed', id })
    },
    [isLocal],
  )

  return {
    tasks,
    status: state.status,
    error: state.error,
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
  }
}
