import { useTaskContext } from '../../hooks/useTaskContext'
import { getStats } from '../../utils/tasks'
import './TaskStats.scss'

function TaskStats() {
  const { tasks, total } = useTaskContext()
  // статистика сторінки рахується під час рендеру, загальна кількість приходить з API
  const stats = getStats(tasks)

  const items = [
    { label: 'Усього в API', value: total, modifier: 'total' },
    { label: 'На сторінці', value: stats.total, modifier: 'page' },
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
