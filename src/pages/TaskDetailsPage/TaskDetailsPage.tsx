import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import TaskFormDialog from '../../components/TaskFormDialog/TaskFormDialog'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useTask } from '../../hooks/useTask'
import { useTaskContext } from '../../hooks/useTaskContext'
import type { TaskFormData } from '../../schemas/taskSchema'
import type { Task } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskDetailsPage.scss'

function formatDate(value: string | null): string {
  return value
    ? new Date(value).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })
    : 'невідомо (API не надає дату)'
}

function TaskDetailsPage() {
  // route param з адреси /tasks/:taskId
  const { taskId } = useParams()
  const id = Number(taskId)

  if (!Number.isInteger(id) || id <= 0) {
    return <DetailsMessage text="Некоректний номер завдання." />
  }
  // key: для іншого id компонент монтується заново й вантажить нові дані
  return <TaskDetails key={id} id={id} />
}

function TaskDetails({ id }: { id: number }) {
  const { isLocalTask, findTask, isDeleted } = useTaskContext()

  if (isDeleted(id)) return <DetailsMessage text="Це завдання видалено." />

  // створене в цій сесії завдання є лише на клієнті: DummyJSON не зберігає POST
  const localTask = isLocalTask(id) ? findTask(id) : undefined
  if (localTask) {
    return (
      <DetailsView
        task={localTask}
        note="Завдання створене в цій сесії: DummyJSON лише імітує POST, тому на сервері його немає."
      />
    )
  }
  return <RemoteDetails id={id} />
}

// Актуальні дані: GET /todos/:id через repository, запит скасовується при виході зі сторінки
function RemoteDetails({ id }: { id: number }) {
  const { status, task, error, retry } = useTask(id)
  const { withLocalChanges } = useTaskContext()

  if (status === 'loading') return <DetailsMessage text="Loading..." />
  if (status === 'error' || !task) {
    return (
      <div className="task-details-page__state task-details-page__state--error" role="alert">
        <p>Помилка завантаження. {error}</p>
        <button type="button" className="task-details-page__button" onClick={retry}>
          Спробувати ще
        </button>
        <Link to="/tasks" className="task-details-page__back">
          ← До списку
        </Link>
      </div>
    )
  }
  // зміни, які DummyJSON не зберіг, накладаємо поверх відповіді сервера
  return <DetailsView task={withLocalChanges(task)} />
}

function DetailsView({ task, note }: { task: Task; note?: string }) {
  const { updateTask, deleteTask } = useTaskContext()
  const requireAuth = useRequireAuth()
  const navigate = useNavigate()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleEdit(data: TaskFormData) {
    const ok = await updateTask(task, data)
    if (!ok) throw new Error('Не вдалося зберегти зміни')
  }

  async function handleDelete() {
    setIsDeleting(true)
    const ok = await deleteTask(task)
    if (ok) {
      navigate('/tasks')
      return
    }
    setIsDeleting(false)
    setIsConfirming(false)
  }

  return (
    <article className="task-details-page">
      <Link to="/tasks" className="task-details-page__back">
        ← До списку
      </Link>

      <h2 className="task-details-page__title">{task.title}</h2>
      {note && <p className="task-details-page__note">{note}</p>}

      <dl className="task-details-page__list">
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
        <dt>Створив</dt>
        <dd>{task.createdBy}</dd>
        <dt>Створено</dt>
        <dd>{formatDate(task.createdAt)}</dd>
      </dl>

      {isConfirming ? (
        <div
          className="task-details-page__confirm"
          role="alertdialog"
          aria-label="Підтвердження видалення"
        >
          <span>Видалити завдання «{task.title}»?</span>
          <button
            type="button"
            className="task-details-page__button task-details-page__button--danger"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Видалення...' : 'Так, видалити'}
          </button>
          <button
            type="button"
            className="task-details-page__button"
            disabled={isDeleting}
            onClick={() => setIsConfirming(false)}
          >
            Ні
          </button>
        </div>
      ) : (
        <div className="task-details-page__actions">
          {/* гість замість діалогу потрапляє на Login */}
          <button
            type="button"
            className="task-details-page__button task-details-page__button--primary"
            onClick={() => requireAuth(() => setIsEditOpen(true))}
          >
            Редагувати
          </button>
          <button
            type="button"
            className="task-details-page__button task-details-page__button--danger"
            onClick={() => requireAuth(() => setIsConfirming(true))}
          >
            Видалити
          </button>
        </div>
      )}

      <TaskFormDialog
        open={isEditOpen}
        mode="edit"
        task={task}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
      />
    </article>
  )
}

function DetailsMessage({ text }: { text: string }) {
  return (
    <div className="task-details-page__state">
      <p>{text}</p>
      <Link to="/tasks" className="task-details-page__back">
        ← До списку
      </Link>
    </div>
  )
}

export default TaskDetailsPage
