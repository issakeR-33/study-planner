import { NavLink, Outlet, useNavigate } from 'react-router'
import Header from '../../components/Header/Header'
import ToastArea from '../../components/Toast/ToastArea'
import { useAuth } from '../../hooks/useAuth'
import './AppLayout.scss'

function navClass({ isActive }: { isActive: boolean }) {
  return `app-layout__link${isActive ? ' app-layout__link--active' : ''}`
}

// Спільний layout: Header, навігація й область контенту (<Outlet /> для дочірніх маршрутів)
function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/tasks')
  }

  return (
    <div className="app-layout">
      <div className="app-layout__top">
        <Header title="Study Planner" subtitle="Навчальні завдання з DummyJSON Todos API" />
        <nav className="app-layout__nav" aria-label="Головне меню">
          {/* NavLink переходить без перезавантаження сторінки й підсвічує активний пункт */}
          <NavLink to="/tasks" className={navClass}>
            Tasks
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            Profile
          </NavLink>
          {isAuthenticated ? (
            <>
              <span className="app-layout__user">{user?.username}</span>
              <button type="button" className="app-layout__logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
          )}
        </nav>
      </div>

      <main className="app-layout__content">
        <Outlet />
      </main>

      <ToastArea />
    </div>
  )
}

export default AppLayout
