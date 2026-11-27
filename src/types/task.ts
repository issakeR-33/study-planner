export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
  /**
   * Хто створив завдання. Для завдань з API це userId з DummyJSON,
   * для створених у застосунку - username поточного користувача.
   */
  createdBy: string
  /**
   * Дата створення (ISO). DummyJSON такого поля не має, тож це client-owned metadata:
   * її ставить клієнт при створенні, а для завдань з сервера вона невідома (null).
   */
  createdAt: string | null
}

/** Дані з форми: те, що користувач вводить сам. */
export type TaskDraft = Pick<Task, 'title' | 'description' | 'category' | 'priority'>

/** Фільтр за станом виконання, зберігається в URL: ?status=completed */
export type TaskFilter = 'all' | 'active' | 'completed'

/** Фільтр за пріоритетом, зберігається в URL: ?priority=high */
export type PriorityFilter = 'all' | Priority

export interface TaskStatsData {
  total: number
  completed: number
  active: number
}
