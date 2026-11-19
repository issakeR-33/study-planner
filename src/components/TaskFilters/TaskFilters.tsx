import { useTaskContext } from '../../hooks/useTaskContext'
import type { TaskFilter, TaskStatsData } from '../../types/task'
import { FILTER_LABELS, getStats } from '../../utils/tasks'
import './TaskFilters.scss'

const FILTERS: { filter: TaskFilter; count: keyof TaskStatsData }[] = [
  { filter: 'all', count: 'total' },
  { filter: 'active', count: 'active' },
  { filter: 'completed', count: 'completed' },
]

function TaskFilters() {
  const { tasks, filter: value, setFilter, clearCompleted, resetTasks } = useTaskContext()
  const stats = getStats(tasks)

  return (
    <div className="task-filters">
      <div className="task-filters__group" role="group" aria-label="Фільтр завдань">
        {FILTERS.map(({ filter, count }) => (
          <button
            key={filter}
            type="button"
            className={`task-filters__button${value === filter ? ' task-filters__button--active' : ''}`}
            aria-pressed={value === filter}
            onClick={() => setFilter(filter)}
          >
            {FILTER_LABELS[filter]}
            <span className="task-filters__count">{stats[count]}</span>
          </button>
        ))}
      </div>

      <div className="task-filters__actions">
        {stats.completed > 0 && (
          <button type="button" className="task-filters__clear" onClick={clearCompleted}>
            Очистити виконані
          </button>
        )}
        <button type="button" className="task-filters__reset" onClick={resetTasks}>
          Скинути дані
        </button>
      </div>
    </div>
  )
}

export default TaskFilters
