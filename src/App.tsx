import { useState } from 'react'
import Header from './components/Header/Header'
import TaskForm from './components/TaskForm/TaskForm'
import TaskList from './components/TaskList/TaskList'
import { initialTasks } from './data/initialTasks'
import type { Task, TaskDraft } from './types/task'
import { createTask } from './utils/tasks'
import './App.scss'

function App() {
  // спільний state живе в App, бо його використовують кілька дочірніх компонентів
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

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

  return (
    <main className="app">
      <Header title="Study Planner" subtitle="Планувальник навчальних завдань" />
      <TaskForm onSubmit={addTask} />
      <TaskList
        tasks={tasks}
        hasAnyTasks={tasks.length > 0}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </main>
  )
}

export default App
