import { useState } from 'react'
import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskStats from './components/TaskStats/TaskStats'
import TaskFilters from './components/TaskFilters/TaskFilters'
import TaskList from './components/TaskList/TaskList'
import { initialTasks } from './data/initialTasks'
import type { Task, TaskDraft, TaskFilter } from './types/task'
import { createTask, filterTasks, getStats } from './utils/tasks'
import './App.scss'

function App() {
  // спільний state живе в App, бо його використовують кілька дочірніх компонентів
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')

  // derived state: обчислюється під час рендеру з поточного масиву
  const visibleTasks = filterTasks(tasks, filter)
  const stats = getStats(tasks)

  // усі оновлення незмінні: створюємо новий масив і нові об'єкти
  function addTask(draft: TaskDraft) {
    setTasks((prev) => [...prev, createTask(prev, draft)])
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    )
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((task) => !task.completed))
  }

  return (
    <main className="app">
      <Header title="Study Planner" subtitle="Планувальник навчальних завдань" />
      <TaskForm onSubmit={addTask} />
      <TaskStats stats={stats} />
      <TaskFilters
        value={filter}
        stats={stats}
        onChange={setFilter}
        onClearCompleted={clearCompleted}
      />
      <TaskList
        tasks={visibleTasks}
        hasAnyTasks={tasks.length > 0}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </main>
  )
}

export default App
