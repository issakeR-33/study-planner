import type { TaskFilter, TaskStatsData } from '../../types/task'
import { FILTER_LABELS } from '../../utils/tasks'
import './TaskFilters.scss'

interface TaskFiltersProps {
  value: TaskFilter
  stats: TaskStatsData
  onChange: (filter: TaskFilter) => void
  onClearCompleted: () => void
}

const FILTERS: { filter: TaskFilter; count: keyof TaskStatsData }[] = [
  { filter: 'all', count: 'total' },
  { filter: 'active', count: 'active' },
  { filter: 'completed', count: 'completed' },
]

function TaskFilters({ value, stats, onChange, onClearCompleted }: TaskFiltersProps) {
  return (
    <div className="task-filters">
      <div className="task-filters__group" role="group" aria-label="Фільтр завдань">
        {FILTERS.map(({ filter, count }) => (
          <button
            key={filter}
            type="button"
            className={`task-filters__button${value === filter ? ' task-filters__button--active' : ''}`}
            aria-pressed={value === filter}
            onClick={() => onChange(filter)}
          >
            {FILTER_LABELS[filter]}
            <span className="task-filters__count">{stats[count]}</span>
          </button>
        ))}
      </div>

      {stats.completed > 0 && (
        <button type="button" className="task-filters__clear" onClick={onClearCompleted}>
          Очистити виконані
        </button>
      )}
    </div>
  )
}

export default TaskFilters
