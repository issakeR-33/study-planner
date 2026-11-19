export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
}

/** Дані з форми: усе, крім id та стану виконання. */
export type TaskDraft = Omit<Task, 'id' | 'completed'>

export type TaskFilter = 'all' | 'active' | 'completed'

export interface TaskStatsData {
  total: number
  completed: number
  active: number
}
