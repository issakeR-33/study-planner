import { useTaskContext } from '../../hooks/useTaskContext'
import './TaskPagination.scss'

function TaskPagination() {
  const { page, totalPages, goToPage, status } = useTaskContext()

  if (status === 'error') return null

  return (
    <nav className="task-pagination" aria-label="Сторінки списку">
      <button
        type="button"
        className="task-pagination__button"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
      >
        ← Попередня
      </button>
      <span className="task-pagination__info" aria-live="polite">
        Сторінка {page} з {totalPages}
      </span>
      <button
        type="button"
        className="task-pagination__button"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
      >
        Наступна →
      </button>
    </nav>
  )
}

export default TaskPagination
