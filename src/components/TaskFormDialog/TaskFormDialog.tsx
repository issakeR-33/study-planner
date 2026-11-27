import { useEffect, useId, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '../../schemas/taskSchema'
import type { Priority, Task } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskFormDialog.scss'

export interface TaskFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
  onClose: () => void
  /** Має кинути помилку, якщо зберегти не вдалося: тоді діалог лишається відкритим. */
  onSubmit: (data: TaskFormData) => Promise<void>
}

const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[]

const EMPTY: TaskFormData = { title: '', description: '', category: '', priority: 'medium' }

// Одна форма на два сценарії: create (кнопка "+") і edit (сторінка деталей).
// Режим і початкові дані приходять через props.
function TaskFormDialog(props: TaskFormDialogProps) {
  // діалог монтується заново при кожному відкритті, тому форма завжди з актуальними даними
  return props.open ? <TaskFormDialogContent {...props} /> : null
}

function TaskFormDialogContent({ mode, task, onClose, onSubmit }: TaskFormDialogProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
        }
      : EMPTY,
  })

  // доступність: фокус на першому полі при відкритті, повернення фокусу після закриття
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    setFocus('title')
    return () => previous?.focus()
  }, [setFocus])

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (e) {
      setError('root', { message: e instanceof Error ? e.message : 'Не вдалося зберегти' })
    }
  })

  const heading = mode === 'create' ? 'Нове завдання' : 'Редагування завдання'

  return (
    <div className="task-form-dialog">
      <div className="task-form-dialog__backdrop" onClick={isSubmitting ? undefined : onClose} />
      <div
        ref={dialogRef}
        className="task-form-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isSubmitting) onClose()
        }}
      >
        <h2 id={titleId} className="task-form-dialog__title">
          {heading}
        </h2>

        <form className="task-form-dialog__form" onSubmit={submit} noValidate>
          {errors.root && (
            <p className="task-form-dialog__error task-form-dialog__error--root" role="alert">
              {errors.root.message}
            </p>
          )}

          <label className="task-form-dialog__field">
            <span className="task-form-dialog__label">Назва *</span>
            <input
              className="task-form-dialog__input"
              placeholder="Наприклад, React Router"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            {errors.title && (
              <span className="task-form-dialog__error">{errors.title.message}</span>
            )}
          </label>

          <label className="task-form-dialog__field">
            <span className="task-form-dialog__label">Опис</span>
            <textarea
              className="task-form-dialog__input task-form-dialog__input--textarea"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description && (
              <span className="task-form-dialog__error">{errors.description.message}</span>
            )}
          </label>

          <div className="task-form-dialog__row">
            <label className="task-form-dialog__field">
              <span className="task-form-dialog__label">Категорія</span>
              <input
                className="task-form-dialog__input"
                placeholder="React, TypeScript..."
                {...register('category')}
              />
              {errors.category && (
                <span className="task-form-dialog__error">{errors.category.message}</span>
              )}
            </label>

            <label className="task-form-dialog__field">
              <span className="task-form-dialog__label">Пріоритет</span>
              <select className="task-form-dialog__input" {...register('priority')}>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="task-form-dialog__actions">
            <button
              type="button"
              className="task-form-dialog__button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Скасувати
            </button>
            {/* pending state: кнопка заблокована, поки запит не завершився */}
            <button
              type="submit"
              className="task-form-dialog__button task-form-dialog__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : mode === 'create' ? 'Створити' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormDialog
