import './Toast.scss'

export interface ToastProps {
  text: string
  variant?: 'success' | 'error' | 'info'
  /** Кнопка дії, наприклад «Скасувати» для Undoable Delete. */
  action?: { label: string; onClick: () => void }
  /** Тривалість у мс: показується смуга прогресу, що спливає за цей час. */
  progressMs?: number
  onClose?: () => void
}

// Власний компонент сповіщення без сторонніх бібліотек. Сам по собі нічого не таймує:
// коли зникнути, вирішує той, хто його показує.
function Toast({ text, variant = 'success', action, progressMs, onClose }: ToastProps) {
  return (
    <div className={`toast toast--${variant}`} role="status" aria-live="polite">
      <span className="toast__text">{text}</span>
      {action && (
        <button type="button" className="toast__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onClose && (
        <button type="button" className="toast__close" aria-label="Закрити" onClick={onClose}>
          ×
        </button>
      )}
      {progressMs !== undefined && (
        <span
          className="toast__progress"
          style={{ animationDuration: `${progressMs}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default Toast
