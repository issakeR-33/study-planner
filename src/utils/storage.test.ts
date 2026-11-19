import { beforeEach, describe, expect, it } from 'vitest'
import { initialTasks } from '../data/initialTasks'
import { loadTasks, TASKS_STORAGE_KEY } from './storage'

describe('loadTasks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('falls back to the initial list when nothing is saved', () => {
    expect(loadTasks()).toBe(initialTasks)
  })

  it('reads saved tasks', () => {
    const saved = [{ ...initialTasks[0], title: 'Saved' }]
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(saved))
    expect(loadTasks()).toEqual(saved)
  })

  it('ignores broken JSON and data of the wrong shape', () => {
    localStorage.setItem(TASKS_STORAGE_KEY, '{not json')
    expect(loadTasks()).toBe(initialTasks)
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([{ id: 'x' }]))
    expect(loadTasks()).toBe(initialTasks)
  })
})
