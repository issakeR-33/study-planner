import { useTaskContext } from '../../hooks/useTaskContext'
import { useTaskFilters } from '../../hooks/useTaskFilters'
import { filterByPriority, filterTasks } from '../../utils/tasks'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

interface TaskListProps {
  onRetry: () => void
}

function TaskList({ onRetry }: TaskListProps) {
  const { tasks, status, error } = useTaskContext()
  const { status: statusFilter, priority } = useTaskFilters()

  // loading, error, empty і success - окремі видимі стани
  if (status === 'loading') {
    return (
      <p className="task-list__state task-list__state--loading" role="status">
        Loading...
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="task-list__state task-list__state--error" role="alert">
        <p>Помилка завантаження. {error}</p>
        <button type="button" className="task-list__retry" onClick={onRetry}>
          Спробувати ще
        </button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p className="task-list__state">Завдань не знайдено.</p>
  }

  // derived state: фільтри з URL застосовуються до завантаженої сторінки під час рендеру
  const visibleTasks = filterByPriority(filterTasks(tasks, statusFilter), priority)

  if (visibleTasks.length === 0) {
    return <p className="task-list__state">За цим фільтром завдань немає.</p>
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
