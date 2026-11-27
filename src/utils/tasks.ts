import type {
  Priority,
  PriorityFilter,
  Task,
  TaskDraft,
  TaskFilter,
  TaskStatsData,
} from '../types/task'

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

export const FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'Всі',
  active: 'Не виконані',
  completed: 'Виконані',
}

export const DEFAULT_CATEGORY = 'Загальне'

export const TASK_FILTERS: TaskFilter[] = ['all', 'active', 'completed']
export const PRIORITY_FILTERS: PriorityFilter[] = ['all', 'high', 'medium', 'low']

// Повертає новий масив, вихідний список завдань не змінюється.
export function filterTasks(tasks: readonly Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'active':
      return tasks.filter((task) => !task.completed)
    case 'completed':
      return tasks.filter((task) => task.completed)
    default:
      return [...tasks]
  }
}

// Повертає новий масив; 'all' означає без фільтра за пріоритетом
export function filterByPriority(tasks: readonly Task[], priority: PriorityFilter): Task[] {
  return priority === 'all' ? [...tasks] : tasks.filter((task) => task.priority === priority)
}

// Статистика рахується з поточного масиву під час рендеру, окремий state не потрібен.
export function getStats(tasks: readonly Task[]): TaskStatsData {
  const completed = tasks.filter((task) => task.completed).length
  return { total: tasks.length, completed, active: tasks.length - completed }
}

// прибирає зайві пробіли й підставляє категорію за замовчуванням
export function normalizeDraft(draft: TaskDraft): TaskDraft {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim() || DEFAULT_CATEGORY,
    priority: draft.priority,
  }
}

// дані завдання для форми редагування
export function toDraft({ title, description, category, priority }: Task): TaskDraft {
  return { title, description, category, priority }
}
