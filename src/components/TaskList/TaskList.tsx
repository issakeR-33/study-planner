import type { Task } from '../../types/task'
import TaskItem from '../TaskItem/TaskItem'
import './TaskList.scss'

interface TaskListProps {
  tasks: Task[]
  /** Чи є завдання взагалі (до фільтрації), щоб показати правильне порожнє повідомлення. */
  hasAnyTasks: boolean
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskList({ tasks, hasAnyTasks, onToggle, onDelete }: TaskListProps) {
  if (!hasAnyTasks) {
    return (
      <div className="task-list__empty">
        <p>Завдань поки немає.</p>
        <p>Додайте перше навчальне завдання.</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        // стабільний key - id завдання, а не індекс у масиві
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default TaskList
