import { useContext } from 'react'
import { TaskContext, type TaskContextValue } from '../context/taskContext'

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext() можна викликати лише всередині <TaskProvider>')
  }
  return context
}
