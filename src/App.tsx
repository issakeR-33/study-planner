import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskStats from './components/TaskStats/TaskStats'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import ToastArea from './components/Toast/ToastArea'
import { useTaskContext } from './hooks/useTaskContext'
import './App.scss'

// Стан і дії тепер у TaskProvider, App лише складає сторінку з компонентів
function App() {
  const { addTask } = useTaskContext()

  return (
    <main className="app">
      <Header title="Study Planner" subtitle="Планувальник навчальних завдань" />
      <TaskForm onSubmit={addTask} />
      <TaskStats />
      <TaskFilters />
      <TaskList />
      <ToastArea />
    </main>
  )
}

export default App
