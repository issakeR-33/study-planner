import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router'
import { HttpError } from '../../api/httpClient'
import { useAuth } from '../../hooks/useAuth'
import { useTaskContext } from '../../hooks/useTaskContext'
import { loginSchema, type LoginFormData } from '../../schemas/authSchema'
import { safeRedirect } from '../../utils/redirect'
import './LoginPage.scss'

function describeError(error: unknown): string {
  if (error instanceof HttpError && (error.status === 400 || error.status === 401)) {
    return 'Невірний логін або пароль'
  }
  return `Не вдалося увійти: ${error instanceof Error ? error.message : 'невідома помилка'}`
}

function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useTaskContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const usernameId = useId()
  const passwordId = useId()

  // React Hook Form керує полями, а Zod-схема перевіряє їх перед відправкою
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data)
      showToast('Вхід виконано')
      // повертаємось на сторінку, з якої нас перенаправили на Login
      navigate(safeRedirect(searchParams.get('redirect')) ?? '/profile', { replace: true })
    } catch (error) {
      setError('root', { message: describeError(error) })
    }
  })

  return (
    <section className="login-page">
      <h2 className="login-page__title">Вхід</h2>
      <p className="login-page__hint">
        Тестовий акаунт DummyJSON: <code>emilys</code> / <code>emilyspass</code>
      </p>

      <form className="login-page__form" onSubmit={onSubmit} noValidate>
        {errors.root && (
          <p className="login-page__error login-page__error--root" role="alert">
            {errors.root.message}
          </p>
        )}

        <div className="login-page__field">
          <label className="login-page__label" htmlFor={usernameId}>
            Username
          </label>
          <input
            id={usernameId}
            className="login-page__input"
            autoComplete="username"
            aria-invalid={Boolean(errors.username)}
            {...register('username')}
          />
          {/* помилка Zod показується біля свого поля */}
          {errors.username && <span className="login-page__error">{errors.username.message}</span>}
        </div>

        <div className="login-page__field">
          <label className="login-page__label" htmlFor={passwordId}>
            Password
          </label>
          <input
            id={passwordId}
            className="login-page__input"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && <span className="login-page__error">{errors.password.message}</span>}
        </div>

        <button type="submit" className="login-page__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
