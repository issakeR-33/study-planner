import { useTaskContext } from '../../hooks/useTaskContext'
import Toast from './Toast'
import './ToastArea.scss'

// Місце виводу сповіщень у кутку екрана; не перекриває решту інтерфейсу.
function ToastArea() {
  const { toast, dismissToast } = useTaskContext()

  return (
    <div className="toast-area">
      {toast && (
        <Toast key={toast.id} text={toast.text} variant={toast.variant} onClose={dismissToast} />
      )}
    </div>
  )
}

export default ToastArea
