import { useEffect } from 'react'
import { useTask } from '../../hooks/useTask'
import { useTaskContext } from '../../hooks/useTaskContext'
import type { Task } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskDetails.scss'

interface TaskDetailsProps {
  id: number
}

function TaskDetailsBody({ task, note }: { task: Task; note?: string }) {
  return (
    <>
      <h2 className="task-details__title">{task.title}</h2>
      {note && <p className="task-details__note">{note}</p>}
      <dl className="task-details__list">
        <dt>ID</dt>
        <dd>{task.id}</dd>
        <dt>Опис</dt>
        <dd>{task.description || '—'}</dd>
        <dt>Категорія</dt>
        <dd>{task.category}</dd>
        <dt>Пріоритет</dt>
        <dd>{PRIORITY_LABELS[task.priority]}</dd>
        <dt>Стан</dt>
        <dd>{task.completed ? 'Виконано' : 'Не виконано'}</dd>
      </dl>
    </>
  )
}

// Актуальні дані з сервера: GET /todos/:id через repository. Запит скасовується при закритті.
function RemoteDetails({ id, listTask }: { id: number; listTask?: Task }) {
  const { status, task, error, retry } = useTask(id)

  if (status === 'loading') return <p className="task-details__state">Loading...</p>
  if (status === 'error' || !task) {
    return (
      <div className="task-details__state task-details__state--error" role="alert">
        <p>Помилка завантаження. {error}</p>
        <button type="button" className="task-details__retry" onClick={retry}>
          Спробувати ще
        </button>
      </div>
    )
  }
  // опис, категорія й пріоритет - client-only metadata, їх API не повертає;
  // локальні зміни, які DummyJSON не зберіг, накладаємо поверх відповіді сервера
  return <TaskDetailsBody task={listTask ? { ...task, ...listTask } : task} />
}

function TaskDetails({ id }: TaskDetailsProps) {
  const { tasks, closeDetails, isLocalTask } = useTaskContext()
  const listTask = tasks.find((task) => task.id === id)

  // Esc закриває панель
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDetails()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeDetails])

  return (
    <div className="task-details" role="dialog" aria-modal="true" aria-label="Деталі завдання">
      <div className="task-details__backdrop" onClick={closeDetails} />
      <section className="task-details__panel">
        <button
          type="button"
          className="task-details__close"
          aria-label="Закрити"
          onClick={closeDetails}
        >
          ×
        </button>
        {isLocalTask(id) && listTask ? (
          <TaskDetailsBody
            task={listTask}
            note="Завдання створене в цій сесії: DummyJSON лише імітує POST, тому на сервері його немає."
          />
        ) : (
          <RemoteDetails key={id} id={id} listTask={listTask} />
        )}
      </section>
    </div>
  )
}

export default TaskDetails
