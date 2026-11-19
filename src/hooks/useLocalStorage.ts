import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readValue<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? initialValue : (JSON.parse(raw) as T)
  } catch {
    // пошкоджений JSON не ламає застосунок, просто беремо значення за замовчуванням
    return initialValue
  }
}

// useState, значення якого переживає перезавантаження сторінки.
// Читання відбувається один раз під час ініціалізації, запис у сховище є побічним ефектом.
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // сховище може бути недоступне (приватний режим, переповнення), стан у пам'яті лишається
    }
  }, [key, value])

  return [value, setValue]
}
