import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import type { PriorityFilter, TaskFilter } from '../types/task'
import { PRIORITY_FILTERS, TASK_FILTERS } from '../utils/tasks'

function parseStatus(value: string | null): TaskFilter {
  return TASK_FILTERS.includes(value as TaskFilter) ? (value as TaskFilter) : 'all'
}

function parsePriority(value: string | null): PriorityFilter {
  return PRIORITY_FILTERS.includes(value as PriorityFilter) ? (value as PriorityFilter) : 'all'
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

// Фільтри й сторінка живуть лише в URL: /tasks?status=completed&priority=high&page=2.
// Окремого state немає, тож після оновлення сторінки й кнопки "Назад" стан зберігається.
export function useTaskFilters() {
  const [params, setParams] = useSearchParams()

  const status = parseStatus(params.get('status'))
  const priority = parsePriority(params.get('priority'))
  const page = parsePage(params.get('page'))

  // значення за замовчуванням з адреси прибираємо, щоб URL лишався коротким
  const update = useCallback(
    (key: string, value: string, defaultValue: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaultValue) next.delete(key)
        else next.set(key, value)
        return next
      })
    },
    [setParams],
  )

  const setStatus = useCallback((value: TaskFilter) => update('status', value, 'all'), [update])
  const setPriority = useCallback(
    (value: PriorityFilter) => update('priority', value, 'all'),
    [update],
  )
  const setPage = useCallback((value: number) => update('page', String(value), '1'), [update])

  return { status, priority, page, setStatus, setPriority, setPage }
}
