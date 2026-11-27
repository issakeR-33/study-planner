import type { Task } from '../types/task'

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'React Components',
    description: 'Опрацювати базові принципи компонентів React',
    completed: false,
    priority: 'high',
    category: 'React',
    createdBy: 'emilys',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'TypeScript Exercises',
    description: 'Виконати практичні вправи',
    completed: true,
    priority: 'medium',
    category: 'TypeScript',
    createdBy: 'emilys',
    createdAt: null,
  },
  {
    id: 3,
    title: 'JSX і умовний рендеринг',
    description: 'Розібрати &&, тернарний оператор і ранній return',
    completed: false,
    priority: 'medium',
    category: 'React',
    createdBy: 'emilys',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 4,
    title: 'Конспект з Git',
    description: 'Записати команди для роботи з гілками',
    completed: false,
    priority: 'low',
    category: 'Git',
    createdBy: 'emilys',
    createdAt: null,
  },
]
