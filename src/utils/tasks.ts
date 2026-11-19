import type { Priority, Task, TaskDraft, TaskFilter, TaskStatsData } from '../types/task'

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

// Статистика рахується з поточного масиву під час рендеру, окремий state не потрібен.
export function getStats(tasks: readonly Task[]): TaskStatsData {
  const completed = tasks.filter((task) => task.completed).length
  return { total: tasks.length, completed, active: tasks.length - completed }
}

export function nextTaskId(tasks: readonly Task[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1
}

export function createTask(tasks: readonly Task[], draft: TaskDraft): Task {
  return {
    id: nextTaskId(tasks),
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim() || DEFAULT_CATEGORY,
    priority: draft.priority,
    completed: false,
  }
}
