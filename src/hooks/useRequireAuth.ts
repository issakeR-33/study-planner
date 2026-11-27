import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from './useAuth'
import { useTaskContext } from './useTaskContext'

// Обгортка для захищених дій (create / edit / delete). Гостя веде на Login,
// а після входу повертає на ту саму сторінку через ?redirect=.
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useTaskContext()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action()
        return
      }
      showToast('Увійдіть, щоб змінювати завдання', 'info')
      const redirect = encodeURIComponent(location.pathname + location.search)
      navigate(`/login?redirect=${redirect}`)
    },
    [isAuthenticated, showToast, navigate, location.pathname, location.search],
  )
}
