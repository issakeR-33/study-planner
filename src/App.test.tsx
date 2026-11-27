import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { reloadSession } from './auth/session'
import { AuthProvider } from './context/AuthProvider'
import { TaskProvider } from './context/TaskProvider'
import { routes } from './routes/routes'
import { installFakeApi, TEST_TOKEN, type FakeApi } from './test/fakeApi'

// ті самі маршрути, що й у застосунку, але з історією в пам'яті
function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  render(
    <AuthProvider>
      <TaskProvider>
        <RouterProvider router={router} />
      </TaskProvider>
    </AuthProvider>,
  )
  return router
}

function path(router: ReturnType<typeof renderAt>) {
  const { pathname, search } = router.state.location
  return pathname + search
}

function listTitles() {
  return within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent)
}

async function logIn(user: ReturnType<typeof userEvent.setup>) {
  // loader сторінки Login асинхронний, тому чекаємо на поле
  await user.type(await screen.findByLabelText('Username'), 'emilys')
  await user.type(screen.getByLabelText('Password'), 'emilyspass')
  await user.click(screen.getByRole('button', { name: 'Увійти' }))
}

describe('Study Planner routing and auth', () => {
  let api: FakeApi

  beforeEach(() => {
    localStorage.clear()
    reloadSession()
    api = installFakeApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects / to /tasks and shows the list from the API', async () => {
    const router = renderAt('/')
    expect(await screen.findByText('Todo 1')).toBeInTheDocument()
    expect(path(router)).toBe('/tasks')
    expect(screen.getByText('Сторінка 1 з 3')).toBeInTheDocument()
  })

  it('keeps the filters and the page in query params', async () => {
    const user = userEvent.setup()
    const router = renderAt('/tasks?status=completed')
    await screen.findByText('Todo 1')
    // у фейковому API виконане кожне четверте: 1, 5, 9
    expect(listTitles()).toEqual(['Todo 1', 'Todo 5', 'Todo 9'])
    await user.click(screen.getByRole('button', { name: /^Не виконані/ }))
    expect(path(router)).toBe('/tasks?status=active')
    await user.click(screen.getByRole('button', { name: 'Наступна →' }))
    expect(path(router)).toBe('/tasks?status=active&page=2')
    expect(await screen.findByText('Todo 12')).toBeInTheDocument()
  })

  it('opens /tasks/:taskId with the data loaded by id', async () => {
    const user = userEvent.setup()
    const router = renderAt('/tasks')
    await user.click(await screen.findByRole('link', { name: 'Todo 3' }))
    expect(path(router)).toBe('/tasks/3')
    expect(await screen.findByRole('heading', { name: 'Todo 3' })).toBeInTheDocument()
    expect(screen.getByText('user #1')).toBeInTheDocument()
    expect(screen.getByText('невідомо (API не надає дату)')).toBeInTheDocument()
    expect(api.calls).toContain('GET /todos/3')
  })

  it('sends a guest to Login instead of opening the create dialog', async () => {
    const user = userEvent.setup()
    const router = renderAt('/tasks')
    await screen.findByText('Todo 1')
    await user.click(screen.getByRole('button', { name: 'Нове завдання' }))
    expect(path(router)).toBe('/login?redirect=%2Ftasks')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sends a guest from edit on the details page to Login', async () => {
    const user = userEvent.setup()
    const router = renderAt('/tasks/2')
    await user.click(await screen.findByRole('button', { name: 'Редагувати' }))
    expect(path(router)).toBe('/login?redirect=%2Ftasks%2F2')
  })

  it('shows Zod errors next to the login fields', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(await screen.findByRole('button', { name: 'Увійти' }))
    expect(screen.getByText("Введіть ім'я користувача")).toBeInTheDocument()
    expect(screen.getByText('Введіть пароль')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Password'), '123')
    await user.click(screen.getByRole('button', { name: 'Увійти' }))
    expect(screen.getByText('Пароль щонайменше з 6 символів')).toBeInTheDocument()
    expect(api.calls).not.toContain('POST /auth/login')
  })

  it('shows the server error for wrong credentials', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.type(await screen.findByLabelText('Username'), 'emilys')
    await user.type(screen.getByLabelText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: 'Увійти' }))
    expect(await screen.findByText('Невірний логін або пароль')).toBeInTheDocument()
  })

  it('protects /profile with a loader and returns there after login', async () => {
    const user = userEvent.setup()
    const router = renderAt('/profile')
    await screen.findByLabelText('Username')
    expect(path(router)).toBe('/login?redirect=%2Fprofile')
    await logIn(user)
    expect(await screen.findByText('токен підтверджено сервером')).toBeInTheDocument()
    expect(path(router)).toBe('/profile')
    expect(api.authHeaders['GET /auth/me']).toBe(`Bearer ${TEST_TOKEN}`)
  })

  it('creates a task through the dialog after login', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login?redirect=/tasks')
    await logIn(user)
    await screen.findByText('Todo 1')
    expect(path(router)).toBe('/tasks')

    await user.click(screen.getByRole('button', { name: 'Нове завдання' }))
    const dialog = screen.getByRole('dialog', { name: 'Нове завдання' })
    // фокус одразу в полі назви
    expect(within(dialog).getByPlaceholderText('Наприклад, React Router')).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Створити' }))
    expect(within(dialog).getByText('Вкажіть назву завдання')).toBeInTheDocument()

    await user.type(
      within(dialog).getByPlaceholderText('Наприклад, React Router'),
      'Protected routes',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Створити' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(listTitles()[0]).toBe('Protected routes')
    expect(screen.getByText('Завдання створено')).toBeInTheDocument()
    expect(api.authHeaders['POST /todos/add']).toBe(`Bearer ${TEST_TOKEN}`)
  })

  it('edits and deletes a task from the details page after login', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login?redirect=/tasks/2')
    await logIn(user)
    await screen.findByRole('heading', { name: 'Todo 2' })

    await user.click(screen.getByRole('button', { name: 'Редагувати' }))
    const dialog = screen.getByRole('dialog', { name: 'Редагування завдання' })
    const title = within(dialog).getByDisplayValue('Todo 2')
    await user.clear(title)
    await user.type(title, 'Todo 2 edited')
    await user.click(within(dialog).getByRole('button', { name: 'Зберегти' }))
    expect(await screen.findByRole('heading', { name: 'Todo 2 edited' })).toBeInTheDocument()
    expect(api.authHeaders['PUT /todos/2']).toBe(`Bearer ${TEST_TOKEN}`)

    await user.click(screen.getByRole('button', { name: 'Видалити' }))
    await user.click(screen.getByRole('button', { name: 'Так, видалити' }))
    await waitFor(() => expect(path(router)).toBe('/tasks'))
    await screen.findByText('Todo 1')
    expect(listTitles()).not.toContain('Todo 2 edited')
    expect(api.authHeaders['DELETE /todos/2']).toBe(`Bearer ${TEST_TOKEN}`)
  })

  it('closes the dialog with Escape', async () => {
    const user = userEvent.setup()
    renderAt('/login?redirect=/tasks')
    await logIn(user)
    await screen.findByText('Todo 1')
    await user.click(screen.getByRole('button', { name: 'Нове завдання' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes protected routes again after logout', async () => {
    const user = userEvent.setup()
    const router = renderAt('/login?redirect=/profile')
    await logIn(user)
    await screen.findByText('Авторизовано')
    await user.click(within(screen.getByRole('main')).getByRole('button', { name: 'Logout' }))
    // після виходу сторінка профілю сама веде на Login
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await router.navigate('/profile')
    await waitFor(() => expect(path(router)).toBe('/login?redirect=%2Fprofile'))
  })
})
