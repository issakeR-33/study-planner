import { useEffect, useState } from 'react'
import TaskFilters from '../../components/TaskFilters/TaskFilters'
import TaskFormDialog from '../../components/TaskFormDialog/TaskFormDialog'
import TaskList from '../../components/TaskList/TaskList'
import TaskPagination from '../../components/TaskPagination/TaskPagination'
import TaskStats from '../../components/TaskStats/TaskStats'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useTaskContext } from '../../hooks/useTaskContext'
import { useTaskFilters } from '../../hooks/useTaskFilters'
import type { TaskFormData } from '../../schemas/taskSchema'
import './TasksPage.scss'

function TasksPage() {
  const { loadPage, createTask } = useTaskContext()
  const { page } = useTaskFilters()
  const requireAuth = useRequireAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  // збільшення ключа повторює запит тієї самої сторінки ("Спробувати ще", "Оновити")
  const [reloadKey, setReloadKey] = useState(0)

  // сторінка з URL визначає запит; зміна сторінки скасовує попередній GET
  useEffect(() => {
    const controller = new AbortController()
    void loadPage(page, controller.signal)
    return () => controller.abort()
  }, [loadPage, page, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  async function handleCreate(data: TaskFormData) {
    const ok = await createTask(data)
    if (!ok) throw new Error('Не вдалося створити завдання')
  }

  return (
    <section className="tasks-page">
      <div className="tasks-page__head">
        <h2 className="tasks-page__title">Завдання</h2>
        <button
          type="button"
          className="tasks-page__add"
          aria-label="Нове завдання"
          title="Нове завдання"
          onClick={() => requireAuth(() => setIsCreateOpen(true))}
        >
          +
        </button>
      </div>

      <TaskStats />
      <TaskFilters onReload={reload} />
      <TaskList onRetry={reload} />
      <TaskPagination />

      <TaskFormDialog
        open={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </section>
  )
}

export default TasksPage
