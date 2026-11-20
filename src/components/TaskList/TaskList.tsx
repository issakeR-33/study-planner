import { useTaskContext } from '../../hooks/useTaskContext'
import { filterTasks } from '../../utils/tasks'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, status, error, reload, filter } = useTaskContext()

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
        <button type="button" className="task-list__retry" onClick={reload}>
          Спробувати ще
        </button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p className="task-list__state">Завдань не знайдено.</p>
  }

  // derived state: фільтр застосовується до завантаженої сторінки під час рендеру
  const visibleTasks = filterTasks(tasks, filter)

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
