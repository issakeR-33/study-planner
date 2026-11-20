import { useState } from 'react'
import { useTaskContext } from '../../hooks/useTaskContext'
import type { Task, TaskDraft } from '../../types/task'
import { PRIORITY_LABELS, toDraft } from '../../utils/tasks'
import TaskForm from '../TaskForm/TaskForm'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

type Mode = 'view' | 'edit' | 'confirmDelete'

function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, updateTask, deleteTask, openDetails } = useTaskContext()
  // режим елемента (перегляд, редагування, підтвердження видалення) - локальний UI-стан
  const [mode, setMode] = useState<Mode>('view')
  const [isBusy, setIsBusy] = useState(false)

  async function save(draft: TaskDraft) {
    const ok = await updateTask(task, draft)
    if (ok) setMode('view')
    return ok
  }

  async function confirmDelete() {
    setIsBusy(true)
    const ok = await deleteTask(task)
    // після успіху елемент зникає зі списку, тож стан оновлюємо лише при помилці
    if (!ok) {
      setIsBusy(false)
      setMode('view')
    }
  }

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    mode === 'confirmDelete' && 'task-item--pending',
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
          onChange={() => toggleTask(task)}
          aria-label={task.completed ? 'Позначити як невиконане' : 'Позначити як виконане'}
        />

        <div className="task-item__body">
          <h3 className="task-item__title">
            <button type="button" className="task-item__link" onClick={() => openDetails(task.id)}>
              {task.title}
            </button>
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

        {mode === 'view' && (
          <div className="task-item__actions">
            <button type="button" className="task-item__button" onClick={() => toggleTask(task)}>
              {task.completed ? 'Повернути' : 'Виконано'}
            </button>
            <button type="button" className="task-item__button" onClick={() => setMode('edit')}>
              Редагувати
            </button>
            <button
              type="button"
              className="task-item__button task-item__button--danger"
              onClick={() => setMode('confirmDelete')}
            >
              Видалити
            </button>
          </div>
        )}
      </div>

      {mode === 'confirmDelete' && (
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
            onClick={() => setMode('view')}
          >
            Ні
          </button>
        </div>
      )}

      {mode === 'edit' && (
        <TaskForm
          initialDraft={toDraft(task)}
          heading="Редагування завдання"
          submitLabel="Зберегти"
          onSubmit={save}
          onCancel={() => setMode('view')}
        />
      )}
    </li>
  )
}

export default TaskItem
