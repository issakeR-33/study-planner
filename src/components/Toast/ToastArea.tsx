import { UNDO_DELAY_MS } from '../../context/TaskProvider'
import { useTaskContext } from '../../hooks/useTaskContext'
import Toast from './Toast'
import './ToastArea.scss'

// Місце виводу сповіщень у кутку екрана; не перекриває решту інтерфейсу.
function ToastArea() {
  const { pendingDelete, undoDelete, toast, dismissToast } = useTaskContext()

  return (
    <div className="toast-area">
      {pendingDelete && (
        <Toast
          // новий key перезапускає анімацію прогресу для кожного нового видалення
          key={pendingDelete.ids.join(',')}
          text={
            pendingDelete.kind === 'completed'
              ? `Виконані завдання (${pendingDelete.ids.length}) буде видалено`
              : 'Завдання буде видалено'
          }
          variant="error"
          action={{ label: 'Скасувати', onClick: undoDelete }}
          progressMs={UNDO_DELAY_MS}
        />
      )}
      {toast && (
        <Toast key={toast.id} text={toast.text} variant={toast.variant} onClose={dismissToast} />
      )}
    </div>
  )
}

export default ToastArea
