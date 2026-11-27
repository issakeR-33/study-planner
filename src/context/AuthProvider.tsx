import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { clearSession, getSession, setSession, subscribe } from '../auth/session'
import { authRepository } from '../repositories/authRepository'
import type { LoginCredentials } from '../types/auth'
import { AuthContext, type AuthContextValue } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

// Auth Context: хто увійшов, його токен і дії login / logout.
// Сам стан сесії лежить у auth/session.ts, а провайдер підписується на нього,
// тож компоненти оновлюються і після logout з будь-якого місця (наприклад, на 401).
export function AuthProvider({ children }: AuthProviderProps) {
  const session = useSyncExternalStore(subscribe, getSession)

  const login = useCallback(async (credentials: LoginCredentials) => {
    // POST /auth/login повертає accessToken, refreshToken і дані користувача
    setSession(await authRepository.login(credentials))
  }, [])

  const logout = useCallback(() => clearSession(), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
