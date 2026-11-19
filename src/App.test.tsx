import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

function taskTitles() {
  return screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent)
}

describe('Study Planner', () => {
  it('adds a task and clears the form', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByPlaceholderText('Наприклад, React Hooks')
    await user.type(title, 'useState')
    await user.click(screen.getByRole('button', { name: 'Додати' }))
    expect(taskTitles()).toContain('useState')
    expect(title).toHaveValue('')
  })

  it('does not add a task without a title', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Додати' }))
    expect(screen.getByText('Вкажіть назву завдання')).toBeInTheDocument()
    expect(taskTitles()).toHaveLength(4)
  })

  it('toggles a task and updates the statistics', async () => {
    const user = userEvent.setup()
    render(<App />)
    const stats = screen.getByLabelText('Статистика')
    expect(within(stats).getByText('Виконано').previousSibling).toHaveTextContent('1')
    await user.click(screen.getAllByRole('button', { name: 'Виконано' })[0])
    expect(within(stats).getByText('Виконано').previousSibling).toHaveTextContent('2')
  })

  it('filters the list and shows the empty filter message', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Виконані/ }))
    expect(taskTitles()).toEqual(['TypeScript Exercises'])
    await user.click(screen.getByRole('button', { name: 'Очистити виконані' }))
    expect(screen.getByText('За цим фільтром завдань немає.')).toBeInTheDocument()
  })

  it('shows the empty list message when every task is deleted', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const button of screen.getAllByRole('button', { name: 'Видалити' })) {
      await user.click(button)
    }
    expect(screen.getByText('Завдань поки немає.')).toBeInTheDocument()
  })
})
