import { request } from '../api/httpClient'
import type { AuthTokens, AuthUser, LoginCredentials } from '../types/auth'

// час життя accessToken у хвилинах, який просимо в DummyJSON
const TOKEN_TTL_MINUTES = 60

type LoginResponse = AuthUser & AuthTokens

function toAuthUser({ id, username, email, firstName, lastName, image }: AuthUser): AuthUser {
  return { id, username, email, firstName, lastName, image }
}

export const authRepository = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser } & AuthTokens> {
    const { accessToken, refreshToken, ...user } = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { ...credentials, expiresInMins: TOKEN_TTL_MINUTES },
    })
    return { user: toAuthUser(user), accessToken, refreshToken }
  },

  // захищений endpoint: HTTP-клієнт додасть Authorization: Bearer <accessToken>
  async me(signal?: AbortSignal): Promise<AuthUser> {
    return toAuthUser(await request<AuthUser>('/auth/me', { auth: true, signal }))
  },
}
