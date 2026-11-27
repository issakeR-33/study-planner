import { useTaskContext } from '../../hooks/useTaskContext'
import { useTaskFilters } from '../../hooks/useTaskFilters'
import './TaskPagination.scss'

function TaskPagination() {
  const { totalPages, status } = useTaskContext()
  // номер сторінки теж у URL: ?page=2
  const { page, setPage } = useTaskFilters()

  if (status === 'error') return null

  return (
    <nav className="task-pagination" aria-label="Сторінки списку">
      <button
        type="button"
        className="task-pagination__button"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
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
        onClick={() => setPage(page + 1)}
      >
        Наступна →
      </button>
    </nav>
  )
}

export default TaskPagination
