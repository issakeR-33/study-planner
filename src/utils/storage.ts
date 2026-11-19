import { initialTasks } from '../data/initialTasks'
import type { Task } from '../types/task'

export const TASKS_STORAGE_KEY = 'study-planner:tasks'

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'number' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.category === 'string' &&
    (task.priority === 'low' || task.priority === 'medium' || task.priority === 'high')
  )
}

// Читає завдання з localStorage. Якщо даних немає або вони пошкоджені
// (невалідний JSON чи не той формат), повертає початковий список.
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY)
    if (raw === null) return initialTasks
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every(isTask) ? parsed : initialTasks
  } catch {
    return initialTasks
  }
}
