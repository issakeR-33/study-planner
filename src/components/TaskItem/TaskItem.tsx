import { useState } from 'react'
import { Link } from 'react-router'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useTaskContext } from '../../hooks/useTaskContext'
import type { Task } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask } = useTaskContext()
  // гість замість дії потрапляє на Login
  const requireAuth = useRequireAuth()
  // підтвердження видалення - локальний UI-стан елемента
  const [isConfirming, setIsConfirming] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  async function confirmDelete() {
    setIsBusy(true)
    const ok = await deleteTask(task)
    // після успіху елемент зникає зі списку, тож стан оновлюємо лише при помилці
    if (!ok) {
      setIsBusy(false)
      setIsConfirming(false)
    }
  }

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isConfirming && 'task-item--pending',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className}>
      <div className="task-item__row">
        <input
          type="checkbox"
          className="task-item__checkbox"
          checked={task.completed}
          onChange={() => requireAuth(() => toggleTask(task))}
          aria-label={task.completed ? 'Позначити як невиконане' : 'Позначити як виконане'}
        />

        <div className="task-item__body">
          <h3 className="task-item__title">
            {/* route param: /tasks/:taskId */}
            <Link to={`/tasks/${task.id}`} className="task-item__link">
              {task.title}
            </Link>
          </h3>
          {task.description && <p className="task-item__description">{task.description}</p>}
          <div className="task-item__meta">
            <span className="task-item__category">{task.category}</span>
            <span className={`task-item__priority task-item__priority--${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className="task-item__status">{task.completed ? 'Виконано' : 'В роботі'}</span>
          </div>
        </div>

        {!isConfirming && (
          <div className="task-item__actions">
            <button
              type="button"
              className="task-item__button"
              onClick={() => requireAuth(() => toggleTask(task))}
            >
              {task.completed ? 'Повернути' : 'Виконано'}
            </button>
            <button
              type="button"
              className="task-item__button task-item__button--danger"
              onClick={() => requireAuth(() => setIsConfirming(true))}
            >
              Видалити
            </button>
          </div>
        )}
      </div>

      {isConfirming && (
        <div className="task-item__confirm" role="alertdialog" aria-label="Підтвердження видалення">
          <span>Видалити завдання «{task.title}»?</span>
          <button
            type="button"
            className="task-item__button task-item__button--danger"
            disabled={isBusy}
            onClick={confirmDelete}
          >
            {isBusy ? 'Видалення...' : 'Так, видалити'}
          </button>
          <button
            type="button"
            className="task-item__button"
            disabled={isBusy}
            onClick={() => setIsConfirming(false)}
          >
            Ні
          </button>
        </div>
      )}
    </li>
  )
}

export default TaskItem
