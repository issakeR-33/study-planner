import type { Task } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const className = `task-item${task.completed ? ' task-item--completed' : ''}`

  return (
    <li className={className}>
      <label className="task-item__check">
        <input
          type="checkbox"
          className="task-item__checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={task.completed ? 'Позначити як невиконане' : 'Позначити як виконане'}
        />
      </label>

      <div className="task-item__body">
        <h3 className="task-item__title">{task.title}</h3>
        {task.description && <p className="task-item__description">{task.description}</p>}
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="task-item__status">{task.completed ? 'Виконано' : 'В роботі'}</span>
        </div>
      </div>

      <div className="task-item__actions">
        <button type="button" className="task-item__button" onClick={() => onToggle(task.id)}>
          {task.completed ? 'Повернути' : 'Виконано'}
        </button>
        <button
          type="button"
          className="task-item__button task-item__button--danger"
          onClick={() => onDelete(task.id)}
        >
          Видалити
        </button>
      </div>
    </li>
  )
}

export default TaskItem
