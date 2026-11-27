import { redirect, type RouteObject } from 'react-router'
import AppLayout from '../layouts/AppLayout/AppLayout'
import LoginPage from '../pages/LoginPage/LoginPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import TaskDetailsPage from '../pages/TaskDetailsPage/TaskDetailsPage'
import TasksPage from '../pages/TasksPage/TasksPage'
import { guestOnlyLoader, requireAuthLoader } from './loaders'

// Data Mode (непарний варіант): маршрути описані об'єктами, захист - через loader + redirect.
// AppLayout - батьківський маршрут, сторінки рендеряться в його <Outlet />.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, loader: () => redirect('/tasks') },
      { path: 'tasks', element: <TasksPage /> },
      // route param: /tasks/42 -> useParams().taskId === '42'
      { path: 'tasks/:taskId', element: <TaskDetailsPage /> },
      { path: 'login', loader: guestOnlyLoader, element: <LoginPage /> },
      { path: 'profile', loader: requireAuthLoader, element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
