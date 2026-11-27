import { useCallback, useMemo, useReducer } from 'react'
import { isAbortError } from '../api/httpClient'
import {
  initialTasksState,
  isLocalTask,
  selectTasks,
  selectTotal,
  tasksReducer,
} from '../reducers/taskReducer'
import { taskRepository, type TaskAuthor, type TaskPatch } from '../repositories/taskRepository'
import type { Task, TaskDraft } from '../types/task'
import { errorText } from '../utils/errors'

export const PAGE_SIZE = 10

// Server state списку завдань: сторінка з API та CRUD через repository.
// Яку сторінку вантажити, вирішує сторінка /tasks за query-параметром ?page=.
export function useTasks() {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState)

  // signal від AbortController дозволяє скасувати запит, якщо сторінка змінилась
  const loadPage = useCallback(async (page: number, signal: AbortSignal) => {
    dispatch({ type: 'fetchStart' })
    try {
      const result = await taskRepository.getAll({
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        signal,
      })
      dispatch({ type: 'fetchSuccess', page: result })
    } catch (error) {
      // скасований запит не є помилкою для користувача
      if (!isAbortError(error)) dispatch({ type: 'fetchError', error: errorText(error) })
    }
  }, [])

  // derived state перераховується лише при зміні server state
  const tasks = useMemo(() => selectTasks(state), [state])
  const total = selectTotal(state)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const isLocal = useCallback((id: number) => isLocalTask(state, id), [state])

  // створене в цій сесії завдання може бути не на поточній сторінці
  const findTask = useCallback(
    (id: number) =>
      state.changes.created.find((task) => task.id === id) ?? tasks.find((task) => task.id === id),
    [state.changes.created, tasks],
  )

  const isDeleted = useCallback(
    (id: number) => state.changes.deletedIds.includes(id),
    [state.changes.deletedIds],
  )

  const create = useCallback(async (draft: TaskDraft, author: TaskAuthor) => {
    const task = await taskRepository.create(draft, author)
    dispatch({ type: 'created', task })
    return task
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

  // локальні зміни поверх даних з сервера (для сторінки деталей)
  const withLocalChanges = useCallback(
    (task: Task) => state.changes.updated[task.id] ?? task,
    [state.changes.updated],
  )

  return {
    tasks,
    status: state.status,
    error: state.error,
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
  }
}
