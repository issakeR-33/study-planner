import type { Session } from '../types/auth'

// Сесія живе поза React у звичайному модулі. Так її можуть читати і компоненти
// (через AuthContext), і loader-и роутера, і HTTP-клієнт, де hooks недоступні.

export const SESSION_STORAGE_KEY = 'study-planner:session'

type Listener = () => void

function load(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    return parsed.accessToken && parsed.user ? (parsed as Session) : null
  } catch {
    return null
  }
}

// сесія відновлюється після перезавантаження сторінки
let current: Session | null = load()
const listeners = new Set<Listener>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function getSession(): Session | null {
  return current
}

export function getAccessToken(): string | null {
  return current?.accessToken ?? null
}

export function isAuthenticated(): boolean {
  return current !== null
}

export function setSession(session: Session): void {
  current = session
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  emit()
}

export function clearSession(): void {
  if (!current) return
  current = null
  localStorage.removeItem(SESSION_STORAGE_KEY)
  emit()
}

/** Підписка для useSyncExternalStore у AuthProvider. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Для тестів: перечитати сесію з localStorage. */
export function reloadSession(): void {
  current = load()
  emit()
}
