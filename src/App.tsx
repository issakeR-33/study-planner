import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './context/AuthProvider'
import { TaskProvider } from './context/TaskProvider'
import { router } from './routes/router'

// Провайдери стоять над роутером, тому стан сесії й завдань не губиться при переходах
function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <RouterProvider router={router} />
      </TaskProvider>
    </AuthProvider>
  )
}

export default App
