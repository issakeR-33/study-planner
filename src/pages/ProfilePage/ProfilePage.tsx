import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { isAbortError } from '../../api/httpClient'
import { useAuth } from '../../hooks/useAuth'
import { authRepository } from '../../repositories/authRepository'
import type { AuthUser } from '../../types/auth'
import { errorText } from '../../utils/errors'
import './ProfilePage.scss'

// Захищений маршрут: гостя сюди не пускає loader (routes/loaders.ts)
function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState<AuthUser | null>(null)
  const [meError, setMeError] = useState<string | null>(null)

  // GET /auth/me з Authorization: Bearer <accessToken> підтверджує, що токен дійсний
  useEffect(() => {
    if (!isAuthenticated) return
    const controller = new AbortController()
    authRepository
      .me(controller.signal)
      .then(setMe)
      .catch((error: unknown) => {
        if (!isAbortError(error)) setMeError(errorText(error))
      })
    return () => controller.abort()
  }, [isAuthenticated])

  // сесія могла закінчитися вже на сторінці (наприклад, сервер відповів 401)
  if (!isAuthenticated) return <Navigate to="/login?redirect=/profile" replace />

  const profile = me ?? user

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="profile-page">
      <h2 className="profile-page__title">Профіль</h2>
      {profile?.image && <img className="profile-page__avatar" src={profile.image} alt="" />}

      <dl className="profile-page__list">
        <dt>Username</dt>
        <dd>{profile?.username}</dd>
        <dt>Email</dt>
        <dd>{profile?.email}</dd>
        <dt>Ім'я</dt>
        <dd>
          {profile?.firstName} {profile?.lastName}
        </dd>
        <dt>Статус</dt>
        <dd className="profile-page__status">Авторизовано</dd>
        <dt>/auth/me</dt>
        <dd>{me ? 'токен підтверджено сервером' : (meError ?? 'перевірка...')}</dd>
      </dl>

      <button type="button" className="profile-page__logout" onClick={handleLogout}>
        Logout
      </button>
    </section>
  )
}

export default ProfilePage
