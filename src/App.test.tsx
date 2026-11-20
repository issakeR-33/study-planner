import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { TaskProvider } from './context/TaskProvider'
import { installFakeApi, type FakeApi } from './test/fakeApi'

function renderApp() {
  return render(
    <TaskProvider>
      <App />
    </TaskProvider>,
  )
}

function listTitles() {
  return within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent)
}

describe('Study Planner with REST API', () => {
  let api: FakeApi

  beforeEach(() => {
    localStorage.clear()
    api = installFakeApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows loading, then the first page from the API', async () => {
    renderApp()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(await screen.findByText('Todo 1')).toBeInTheDocument()
    expect(listTitles()).toHaveLength(10)
    expect(screen.getByText('Сторінка 1 з 3')).toBeInTheDocument()
    expect(api.calls).toEqual(['GET /todos?limit=10&skip=0'])
  })

  it('moves to the next page with skip', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Todo 1')
    await user.click(screen.getByRole('button', { name: 'Наступна →' }))
    expect(await screen.findByText('Todo 11')).toBeInTheDocument()
    expect(screen.getByText('Сторінка 2 з 3')).toBeInTheDocument()
    expect(api.calls).toContain('GET /todos?limit=10&skip=10')
  })

  it('aborts the previous page request when the page changes', async () => {
    const user = userEvent.setup()
    renderApp()
    // клік до завершення першого запиту
    await user.click(screen.getByRole('button', { name: 'Наступна →' }))
    await screen.findByText('Todo 11')
    const firstSignal = (api.fetch.mock.calls[0]?.[1] as RequestInit).signal
    expect(firstSignal?.aborted).toBe(true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the error state and retries the request', async () => {
    api.failNext('GET')
    const user = userEvent.setup()
    renderApp()
    expect(await screen.findByText(/Помилка завантаження/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Спробувати ще' }))
    expect(await screen.findByText('Todo 1')).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    api.todos.length = 0
    renderApp()
    expect(await screen.findByText('Завдань не знайдено.')).toBeInTheDocument()
  })

  it('creates a task through POST, shows it first and clears the form', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Todo 1')
    const title = screen.getByPlaceholderText('Наприклад, React Hooks')
    await user.type(title, 'REST API')
    await user.click(screen.getByRole('button', { name: 'Додати' }))
    expect(await screen.findByText('Завдання створено')).toBeInTheDocument()
    expect(listTitles()[0]).toBe('REST API')
    expect(title).toHaveValue('')
    expect(api.calls).toContain('POST /todos/add')
  })

  it('deletes a task after confirmation', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Todo 1')
    await user.click(screen.getAllByRole('button', { name: 'Видалити' })[0])
    await user.click(screen.getByRole('button', { name: 'Так, видалити' }))
    await waitFor(() => expect(listTitles()).not.toContain('Todo 1'))
    expect(api.calls).toContain('DELETE /todos/1')
  })

  it('rolls back an optimistic toggle when PUT fails', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByText('Todo 2')
    api.failNext('PUT')
    const checkbox = screen.getAllByRole('checkbox')[1]
    await user.click(checkbox)
    expect(await screen.findByText(/Не вдалося змінити стан/)).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('opens the details loaded by id', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(await screen.findByRole('button', { name: 'Todo 3' }))
    const dialog = screen.getByRole('dialog')
    expect(await within(dialog).findByText('Todo 3', { selector: 'h2' })).toBeInTheDocument()
    expect(api.calls).toContain('GET /todos/3')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
