# Study Planner

Навчальний планувальник завдань на React 19 + TypeScript.
Спільний застосунок для лабораторних 8–11 з курсу «Інженерія клієнтських веб-систем».

| Лабораторна | Гілка                        | Тема                                                     |
| ----------- | ---------------------------- | -------------------------------------------------------- |
| №8          | `feature/react-fundamentals` | компоненти, JSX, props, `useState`, події, списки        |
| №9          | `feature/state-effects`      | `useReducer`, Context API, `useEffect`, custom hooks     |

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
npm install
npm run dev          # dev-сервер Vite
npm run build        # перевірка типів і збірка в dist/
npm run lint         # ESLint
npm test             # Vitest + Testing Library
```

## Лабораторна №8: React Fundamentals

Дані живуть у пам'яті React (`useState` в `App`), після перезавантаження сторінки повертається початковий список.

- **Модель** `Task` (`src/types/task.ts`): `id`, `title`, `description`, `completed`, `priority` (`low` / `medium` / `high`), `category`.
- **Компоненти** (`src/components/`), кожен зі своїм `.scss` за BEM:
  - `Header` показує назву застосунку;
  - `TaskForm` додає завдання: назва обов'язкова, після додавання форма очищується, помилка показується під полем (без `alert`);
  - `TaskStats` показує, скільки всього, виконаних і невиконаних;
  - `TaskFilters` перемикає «Всі» / «Не виконані» / «Виконані» з лічильниками, активний фільтр підсвічено, є кнопка «Очистити виконані»;
  - `TaskList` рендерить завдання через `map` з `key={task.id}`, показує повідомлення для порожнього списку й порожнього фільтра;
  - `TaskItem` показує назву, опис, категорію, пріоритет, стан, кнопки «Виконано» / «Повернути» та «Видалити». Виконане завдання приглушене й перекреслене.
- **State і props.** `tasks` і `filter` лежать в `App`, дочірні компоненти отримують дані через props, а зміни передають через callback-функції `onSubmit`, `onToggle`, `onDelete`, `onChange`.
- **Незмінні оновлення.** Додавання робиться через `[...prev, task]`, перемикання через `map` з `{ ...task, completed }`, видалення через `filter`.
- **Derived state.** Відфільтрований список і статистика обчислюються під час рендеру (`src/utils/tasks.ts`), окремого state для лічильників немає.

### Структура

```
src/
  components/   Header, TaskForm, TaskList, TaskItem, TaskFilters, TaskStats (tsx + scss)
  data/         initialTasks.ts
  types/        task.ts
  utils/        tasks.ts: фільтрація, статистика, створення завдання
  styles/       global.scss: reset, шрифт, кольори
  App.tsx       state застосунку та обробники подій
```
