import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with the initial value and writes changes to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'all'))
    expect(result.current[0]).toBe('all')
    act(() => result.current[1]('completed'))
    expect(result.current[0]).toBe('completed')
    expect(localStorage.getItem('key')).toBe('"completed"')
  })

  it('reads a saved value and survives broken JSON', () => {
    localStorage.setItem('saved', '"active"')
    expect(renderHook(() => useLocalStorage('saved', 'all')).result.current[0]).toBe('active')
    localStorage.setItem('broken', '{oops')
    expect(renderHook(() => useLocalStorage('broken', 'all')).result.current[0]).toBe('all')
  })
})
