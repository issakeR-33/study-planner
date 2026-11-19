import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { TaskProvider, UNDO_DELAY_MS } from './context/TaskProvider'
import { TASKS_STORAGE_KEY } from './utils/storage'

function renderApp() {
  return render(
    <TaskProvider>
      <App />
    </TaskProvider>,
  )
}

function taskTitles() {
  return screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent)
}

function savedTitles(): string[] {
  const saved = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) ?? '[]') as { title: string }[]
  return saved.map((task) => task.title)
}

describe('Study Planner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a task, shows a toast and saves the list to localStorage', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.type(screen.getByPlaceholderText('Наприклад, React Hooks'), 'useReducer')
    await user.click(screen.getByRole('button', { name: 'Додати' }))
    expect(taskTitles()).toContain('useReducer')
    expect(screen.getByText('Завдання додано')).toBeInTheDocument()
    expect(savedTitles()).toContain('useReducer')
  })

  it('restores tasks from localStorage after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp()
    await user.click(screen.getAllByRole('button', { name: 'Виконано' })[0])
    unmount()
    renderApp()
    const stats = screen.getByLabelText('Статистика')
    expect(within(stats).getByText('Виконано').previousSibling).toHaveTextContent('2')
  })

  it('edits a task through the form in edit mode', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getAllByRole('button', { name: 'Редагувати' })[0])
    const title = screen.getByDisplayValue('React Components')
    await user.clear(title)
    await user.type(title, 'React Hooks')
    await user.click(screen.getByRole('button', { name: 'Зберегти' }))
    expect(taskTitles()[0]).toBe('React Hooks')
    expect(screen.getByText('Зміни збережено')).toBeInTheDocument()
  })

  it('undoes a delete before the timer ends', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp()
    await user.click(screen.getAllByRole('button', { name: 'Видалити' })[0])
    expect(screen.getByText('Завдання буде видалено')).toBeInTheDocument()
    expect(screen.getByText('Буде видалено')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Скасувати' }))
    act(() => {
      vi.advanceTimersByTime(UNDO_DELAY_MS)
    })
    expect(taskTitles()).toContain('React Components')
  })

  it('deletes the task for good when the timer ends', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp()
    await user.click(screen.getAllByRole('button', { name: 'Видалити' })[0])
    act(() => {
      vi.advanceTimersByTime(UNDO_DELAY_MS)
    })
    expect(taskTitles()).not.toContain('React Components')
    expect(screen.getByText('Завдання видалено')).toBeInTheDocument()
    expect(savedTitles()).not.toContain('React Components')
  })

  it('shows the number of active tasks in the tab title', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(document.title).toBe('Study Planner — 3 active tasks')
    await user.click(screen.getAllByRole('button', { name: 'Виконано' })[0])
    expect(document.title).toBe('Study Planner — 2 active tasks')
  })

  it('keeps the active filter between reloads', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp()
    await user.click(screen.getByRole('button', { name: /^Виконані/ }))
    unmount()
    renderApp()
    expect(taskTitles()).toEqual(['TypeScript Exercises'])
  })
})
