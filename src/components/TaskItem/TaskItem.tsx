import { useState } from 'react'
import { useTaskContext } from '../../hooks/useTaskContext'
import type { Task, TaskDraft } from '../../types/task'
import { PRIORITY_LABELS, toDraft } from '../../utils/tasks'
import TaskForm from '../TaskForm/TaskForm'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  // дії беруться з Context, тому TaskList не прокидає callback-и через props
  const { toggleTask, requestDelete, updateTask, pendingDelete } = useTaskContext()
  // режим редагування - локальний UI-стан саме цього елемента
  const [isEditing, setIsEditing] = useState(false)

  const isPending = pendingDelete?.ids.includes(task.id) ?? false

  function save(draft: TaskDraft) {
    updateTask(task.id, draft)
    setIsEditing(false)
  }

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isPending && 'task-item--pending',
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
          disabled={isPending}
          onChange={() => toggleTask(task.id)}
          aria-label={task.completed ? 'Позначити як невиконане' : 'Позначити як виконане'}
        />

        <div className="task-item__body">
          <h3 className="task-item__title">{task.title}</h3>
          {task.description && <p className="task-item__description">{task.description}</p>}
          <div className="task-item__meta">
            <span className="task-item__category">{task.category}</span>
            <span className={`task-item__priority task-item__priority--${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className="task-item__status">
              {isPending ? 'Буде видалено' : task.completed ? 'Виконано' : 'В роботі'}
            </span>
          </div>
        </div>

        {!isPending && !isEditing && (
          <div className="task-item__actions">
            <button type="button" className="task-item__button" onClick={() => toggleTask(task.id)}>
              {task.completed ? 'Повернути' : 'Виконано'}
            </button>
            <button type="button" className="task-item__button" onClick={() => setIsEditing(true)}>
              Редагувати
            </button>
            <button
              type="button"
              className="task-item__button task-item__button--danger"
              onClick={() => requestDelete(task.id)}
            >
              Видалити
            </button>
          </div>
        )}
      </div>

      {isEditing && (
        <TaskForm
          initialDraft={toDraft(task)}
          heading="Редагування завдання"
          submitLabel="Зберегти"
          onSubmit={save}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </li>
  )
}

export default TaskItem
