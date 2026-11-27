export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/** Поточний користувач з /auth/login і /auth/me (лише потрібні поля DummyJSON). */
export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image?: string
}

export interface Session extends AuthTokens {
  user: AuthUser
}
