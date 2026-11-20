import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../api/httpClient'
import type { RequestStatus } from '../reducers/taskReducer'
import { taskRepository } from '../repositories/taskRepository'
import type { Task } from '../types/task'
import { errorText } from '../utils/errors'

interface TaskQuery {
  status: RequestStatus
  task: Task | null
  error: string | null
}

interface TaskQueryResult extends TaskQuery {
  retry: () => void
}

// Деталі одного завдання через GET /todos/:id. Дані живуть у локальному state компонента.
// Компонент монтується з key={id}, тому для нового id state починається з loading.
export function useTask(id: number): TaskQueryResult {
  const [query, setQuery] = useState<TaskQuery>({ status: 'loading', task: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    taskRepository
      .getById(id, controller.signal)
      .then((task) => setQuery({ status: 'success', task, error: null }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setQuery({ status: 'error', task: null, error: errorText(error) })
      })
    // закриття деталей або інший id скасовує запит
    return () => controller.abort()
  }, [id, attempt])

  const retry = useCallback(() => {
    setQuery({ status: 'loading', task: null, error: null })
    setAttempt((value) => value + 1)
  }, [])

  return { ...query, retry }
}
