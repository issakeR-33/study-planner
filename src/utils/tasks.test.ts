import { describe, expect, it } from 'vitest'
import { initialTasks } from '../data/initialTasks'
import { filterByPriority, filterTasks, getStats, toDraft } from './tasks'

describe('task helpers', () => {
  it('filters without changing the source array', () => {
    const source = [...initialTasks]
    expect(filterTasks(source, 'completed').map((t) => t.id)).toEqual([2])
    expect(filterTasks(source, 'active')).toHaveLength(3)
    expect(filterTasks(source, 'all')).not.toBe(source)
    expect(source).toEqual(initialTasks)
  })

  it('derives the statistics from the array', () => {
    expect(getStats(initialTasks)).toEqual({ total: 4, completed: 1, active: 3 })
    expect(getStats([])).toEqual({ total: 0, completed: 0, active: 0 })
  })

  it('filters by priority and keeps every task for all', () => {
    expect(filterByPriority(initialTasks, 'high').map((t) => t.id)).toEqual([1])
    expect(filterByPriority(initialTasks, 'all')).toHaveLength(4)
  })

  it('turns a task back into form values', () => {
    expect(toDraft(initialTasks[0])).toEqual({
      title: 'React Components',
      description: 'Опрацювати базові принципи компонентів React',
      category: 'React',
      priority: 'high',
    })
  })
})
