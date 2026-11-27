import { request } from '../api/httpClient'
import type { Task, TaskDraft } from '../types/task'
import { DEFAULT_CATEGORY, normalizeDraft } from '../utils/tasks'

// DTO DummyJSON. Поза repository цих типів ніхто не бачить.
interface ApiTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

interface TodosResponse {
  todos: ApiTodo[]
  total: number
  skip: number
  limit: number
}

export interface TaskPage {
  tasks: Task[]
  total: number
  skip: number
  limit: number
}

export interface PageParams {
  limit: number
  skip: number
  signal?: AbortSignal
}

/** Поля, які можна змінити на сервері. Решта полів Task існує лише на клієнті. */
export type TaskPatch = Partial<Pick<Task, 'title' | 'completed'>>

/** Автор нового завдання: користувач поточної сесії. */
export interface TaskAuthor {
  id: number
  username: string
}

// DummyJSON не має опису, категорії, пріоритету й дати створення: це client-only metadata.
// createdBy будуємо з userId, який API віддає, а createdAt сервер не знає, тому null.
export function toTask(todo: ApiTodo): Task {
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
    completed: todo.completed,
    priority: 'medium',
    category: DEFAULT_CATEGORY,
    createdBy: `user #${todo.userId}`,
    createdAt: null,
  }
}

function toApiPatch(patch: TaskPatch): Partial<Pick<ApiTodo, 'todo' | 'completed'>> {
  return {
    ...(patch.title !== undefined && { todo: patch.title }),
    ...(patch.completed !== undefined && { completed: patch.completed }),
  }
}

// Repository приховує endpoint-и, HTTP-методи й формат DTO
export const taskRepository = {
  async getAll({ limit, skip, signal }: PageParams): Promise<TaskPage> {
    const data = await request<TodosResponse>('/todos', { query: { limit, skip }, signal })
    return { tasks: data.todos.map(toTask), total: data.total, skip: data.skip, limit: data.limit }
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    return toTask(await request<ApiTodo>(`/todos/${id}`, { signal }))
  },

  // Mutation-запити йдуть з Authorization: Bearer <token> (auth: true).
  // Опис, категорію, пріоритет і дату API не зберігає, тому їх задає клієнт.
  async create(draft: TaskDraft, author: TaskAuthor): Promise<Task> {
    const clean = normalizeDraft(draft)
    const todo = await request<ApiTodo>('/todos/add', {
      method: 'POST',
      body: { todo: clean.title, completed: false, userId: author.id },
      auth: true,
    })
    return {
      ...toTask(todo),
      ...clean,
      createdBy: author.username,
      // client-owned: момент створення фіксує клієнт
      createdAt: new Date().toISOString(),
    }
  },

  async update(id: number, patch: TaskPatch): Promise<Task> {
    return toTask(
      await request<ApiTodo>(`/todos/${id}`, {
        method: 'PUT',
        body: toApiPatch(patch),
        auth: true,
      }),
    )
  },

  async delete(id: number): Promise<void> {
    await request<ApiTodo>(`/todos/${id}`, { method: 'DELETE', auth: true })
  },
}

export type TaskRepository = typeof taskRepository
