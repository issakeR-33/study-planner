import { useTaskContext } from '../../hooks/useTaskContext'
import { filterTasks } from '../../utils/tasks'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, filter } = useTaskContext()
  // derived state: рахується під час рендеру, без окремого state чи effect
  const visibleTasks = filterTasks(tasks, filter)

  if (tasks.length === 0) {
    return (
      <div className="task-list__empty">
        <p>Завдань поки немає.</p>
        <p>Додайте перше навчальне завдання.</p>
      </div>
    )
  }

  if (visibleTasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        // стабільний key - id завдання, а не індекс у масиві
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
