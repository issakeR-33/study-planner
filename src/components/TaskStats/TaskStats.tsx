import type { TaskStatsData } from '../../types/task'
import './TaskStats.scss'

interface TaskStatsProps {
  stats: TaskStatsData
}

function TaskStats({ stats }: TaskStatsProps) {
  const items = [
    { label: 'Усього', value: stats.total, modifier: 'total' },
    { label: 'Виконано', value: stats.completed, modifier: 'completed' },
    { label: 'Не виконано', value: stats.active, modifier: 'active' },
  ]

  return (
    <section className="task-stats" aria-label="Статистика">
      {items.map((item) => (
        <div key={item.modifier} className={`task-stats__item task-stats__item--${item.modifier}`}>
          <span className="task-stats__value">{item.value}</span>
          <span className="task-stats__label">{item.label}</span>
        </div>
      ))}
    </section>
  )
}

export default TaskStats
