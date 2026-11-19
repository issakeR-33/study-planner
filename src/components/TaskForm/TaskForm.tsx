import { useState, type FormEvent } from 'react'
import type { Priority, TaskDraft } from '../../types/task'
import { PRIORITY_LABELS } from '../../utils/tasks'
import './TaskForm.scss'

interface TaskFormProps {
  onSubmit: (draft: TaskDraft) => void
  /** Режим редагування: форма заповнена даними завдання й не очищується після збереження. */
  initialDraft?: TaskDraft
  heading?: string
  submitLabel?: string
  onCancel?: () => void
}

const EMPTY_DRAFT: TaskDraft = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
}

const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[]

function TaskForm({
  onSubmit,
  initialDraft,
  heading = 'Нове завдання',
  submitLabel = 'Додати',
  onCancel,
}: TaskFormProps) {
  const isEditing = initialDraft !== undefined
  // значення полів зберігаються в одному об'єкті state і оновлюються копією
  const [draft, setDraft] = useState<TaskDraft>(initialDraft ?? EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof TaskDraft>(field: K, value: TaskDraft[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }))
    if (field === 'title' && error) setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.title.trim()) {
      setError('Вкажіть назву завдання')
      return
    }
    onSubmit(draft)
    if (!isEditing) setDraft(EMPTY_DRAFT)
  }

  return (
    <form
      className={`task-form${isEditing ? ' task-form--editing' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="task-form__title">{heading}</h2>

      <div className="task-form__grid">
        <label className="task-form__field task-form__field--wide">
          <span className="task-form__label">Назва *</span>
          <input
            className={`task-form__input${error ? ' task-form__input--invalid' : ''}`}
            value={draft.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Наприклад, React Hooks"
            aria-invalid={Boolean(error)}
          />
          {error && <span className="task-form__error">{error}</span>}
        </label>

        <label className="task-form__field task-form__field--wide">
          <span className="task-form__label">Опис</span>
          <textarea
            className="task-form__input task-form__input--textarea"
            value={draft.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Що саме потрібно зробити"
            rows={2}
          />
        </label>

        <label className="task-form__field">
          <span className="task-form__label">Категорія</span>
          <input
            className="task-form__input"
            value={draft.category}
            onChange={(event) => updateField('category', event.target.value)}
            placeholder="React, TypeScript..."
          />
        </label>

        <label className="task-form__field">
          <span className="task-form__label">Пріоритет</span>
          <select
            className="task-form__input"
            value={draft.priority}
            onChange={(event) => updateField('priority', event.target.value as Priority)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="task-form__actions">
        <button type="submit" className="task-form__submit">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="task-form__cancel" onClick={onCancel}>
            Скасувати
          </button>
        )}
      </div>
    </form>
  )
}

export default TaskForm
