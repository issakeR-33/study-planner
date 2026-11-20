import { HttpError } from '../api/httpClient'

// Централізоване перетворення помилки на зрозумілий текст для інтерфейсу
export function errorText(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) return 'Завдання не знайдено на сервері'
    if (error.status === 0) return error.message
    return `Помилка сервера (${error.status}): ${error.message}`
  }
  return error instanceof Error ? error.message : 'Невідома помилка'
}
