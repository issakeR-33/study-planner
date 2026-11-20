import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskStats from './components/TaskStats/TaskStats'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import ToastArea from './components/Toast/ToastArea'
import { useTaskContext } from './hooks/useTaskContext'
import './App.scss'

// App лише складає сторінку: дані й дії приходять з TaskProvider,
// а HTTP-запити виконує taskRepository
function App() {
  const { createTask } = useTaskContext()

  return (
    <main className="app">
      <Header title="Study Planner" subtitle="Навчальні завдання з DummyJSON Todos API" />
      <TaskForm onSubmit={createTask} />
      <TaskStats />
      <TaskFilters />
      <TaskList />
      <ToastArea />
    </main>
  )
}

export default App
