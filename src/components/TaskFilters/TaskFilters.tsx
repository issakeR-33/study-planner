import { useTaskContext } from '../../hooks/useTaskContext'
import { useTaskFilters } from '../../hooks/useTaskFilters'
import type { PriorityFilter, TaskFilter, TaskStatsData } from '../../types/task'
import { FILTER_LABELS, getStats, PRIORITY_LABELS } from '../../utils/tasks'
import './TaskFilters.scss'

const FILTERS: { filter: TaskFilter; count: keyof TaskStatsData }[] = [
  { filter: 'all', count: 'total' },
  { filter: 'active', count: 'active' },
  { filter: 'completed', count: 'completed' },
]

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Усі пріоритети' },
  { value: 'high', label: PRIORITY_LABELS.high },
  { value: 'medium', label: PRIORITY_LABELS.medium },
  { value: 'low', label: PRIORITY_LABELS.low },
]

interface TaskFiltersProps {
  onReload: () => void
}

// Фільтри пишуться в query-параметри URL (?status=completed&priority=high)
function TaskFilters({ onReload }: TaskFiltersProps) {
  const { tasks } = useTaskContext()
  const { status, priority, setStatus, setPriority } = useTaskFilters()
  // лічильники рахуються для завантаженої сторінки
  const stats = getStats(tasks)

  return (
    <div className="task-filters">
      <div className="task-filters__group" role="group" aria-label="Фільтр за станом">
        {FILTERS.map(({ filter, count }) => (
          <button
            key={filter}
            type="button"
            className={`task-filters__button${status === filter ? ' task-filters__button--active' : ''}`}
            aria-pressed={status === filter}
            onClick={() => setStatus(filter)}
          >
            {FILTER_LABELS[filter]}
            <span className="task-filters__count">{stats[count]}</span>
          </button>
        ))}
      </div>

      <div className="task-filters__side">
        <select
          className="task-filters__select"
          aria-label="Фільтр за пріоритетом"
          value={priority}
          onChange={(event) => setPriority(event.target.value as PriorityFilter)}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" className="task-filters__reset" onClick={onReload}>
          Оновити
        </button>
      </div>
    </div>
  )
}

export default TaskFilters
