import { redirect, type LoaderFunctionArgs } from 'react-router'
import { isAuthenticated } from '../auth/session'

// Loader виконується роутером до рендеру сторінки, поза React-компонентом,
// тому тут не можна викликати hooks (useAuth). Сесію читаємо напряму з модуля auth/session.

/** Protected route: гостя перенаправляємо на /login і запам'ятовуємо, куди він ішов. */
export function requireAuthLoader({ request }: LoaderFunctionArgs) {
  if (!isAuthenticated()) {
    const { pathname, search } = new URL(request.url)
    throw redirect(`/login?redirect=${encodeURIComponent(pathname + search)}`)
  }
  return null
}

/** Сторінка Login лише для гостей: авторизованого користувача ведемо в профіль. */
export function guestOnlyLoader() {
  if (isAuthenticated()) throw redirect('/profile')
  return null
}
