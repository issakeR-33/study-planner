# Study Planner

Навчальний планувальник завдань на React 19 + TypeScript.
Спільний застосунок для лабораторних 8–11 з курсу «Інженерія клієнтських веб-систем».

| Лабораторна | Гілка                        | Тема                                                 |
| ----------- | ---------------------------- | ---------------------------------------------------- |
| №8          | `feature/react-fundamentals` | компоненти, JSX, props, `useState`, події, списки    |
| №9          | `feature/state-effects`      | `useReducer`, Context API, `useEffect`, custom hooks |
| №10         | `feature/rest-api`           | REST API, Repository, async states, CRUD             |

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
cp .env.example .env  # адреса API (з №10)
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

### Структура після №8

```
src/
  components/   Header, TaskForm, TaskList, TaskItem, TaskFilters, TaskStats (tsx + scss)
  data/         initialTasks.ts
  types/        task.ts
  utils/        tasks.ts: фільтрація, статистика, створення завдання
  styles/       global.scss: reset, шрифт, кольори
  App.tsx       state застосунку та обробники подій
```

## Лабораторна №9: State та Effects

Функціонал №8 збережено, але стан перебудовано: `tasks` живе в reducer, а компоненти отримують дані й дії через Context.

- **`useReducer`** (`src/reducers/taskReducer.ts`). Типізовані дії: `add`, `toggle`, `update`, `requestDelete`, `confirmDelete`, `undoDelete`, `clearCompleted`, `reset`. Reducer чистий: без таймерів, `localStorage`, DOM і HTTP.
- **Context API.** `TaskContext` (`src/context/taskContext.ts`) і `TaskProvider` (`src/context/TaskProvider.tsx`) надають `tasks`, `filter`, `setFilter`, `pendingDelete`, `addTask`, `updateTask`, `toggleTask`, `requestDelete`, `undoDelete`, `clearCompleted`, `resetTasks`, `toast`. Компоненти не знають про reducer і таймери. `value` загорнуто в `useMemo`.
- **Custom hooks:**
  - `useTaskContext()` кидає зрозумілу помилку, якщо його викликати поза `TaskProvider`;
  - `useLocalStorage<T>()` зберігає активний фільтр. Список завдань він не дублює: єдиним джерелом правди для `tasks` лишається reducer.
- **`localStorage` + `useEffect`.** Початковий стан reducer читає `loadTasks()` (`src/utils/storage.ts`). Пошкоджений JSON або дані не того формату замінюються початковим списком. Після кожної зміни `tasks` effect записує їх у сховище.
- **Синхронізація з браузером.** Effect оновлює `document.title`: `Study Planner — 3 active tasks`.
- **Редагування.** `TaskForm` має режим редагування (`initialDraft`), зміни проходять через `dispatch({ type: 'update' })`.
- **Toast.** Власний компонент `Toast` без бібліотек. Показує повідомлення після створення, редагування й остаточного видалення, а також про помилку (наприклад, «Немає виконаних завдань для очищення»). Зникає сам через 3 с і не блокує інтерфейс.
- **Undoable Delete.** «Видалити» лише позначає завдання (`requestDelete`): воно приглушене з написом «Буде видалено», а Toast показує смугу прогресу на 5 с і кнопку «Скасувати». Таймер живе в `useEffect` провайдера і очищується через `clearTimeout` у cleanup, коли видалення скасоване або почалося нове. Після 5 с виконується `confirmDelete`. Одночасно активне одне видалення. «Очистити виконані» працює через той самий undo-flow.
- **Derived state** (відфільтрований список і статистика) так само обчислюється під час рендеру, без effect.
- Кнопка «Скинути дані» повертає початковий список.

### Структура після №9

```
src/
  components/   TaskForm (+ режим редагування), TaskItem, TaskList, TaskFilters, TaskStats, Header, Toast
  context/      taskContext.ts (типи й createContext), TaskProvider.tsx (reducer, effects, дії)
  hooks/        useTaskContext.ts, useLocalStorage.ts
  reducers/     taskReducer.ts
  utils/        tasks.ts, storage.ts
```

## Лабораторна №10: REST API

Локальне джерело даних замінено на [DummyJSON Todos](https://dummyjson.com/docs/todos). Адреса API береться з `VITE_API_URL` (`.env`, у Git лише `.env.example`).

| Шар             | Файл                                                   | Відповідальність                                                                               |
| --------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| HTTP client     | `src/api/httpClient.ts`                                | URL з `VITE_API_URL`, `fetch`, перевірка `response.ok`, `HttpError`, `isAbortError`            |
| Repository      | `src/repositories/taskRepository.ts`                   | endpoint-и `/todos`, DTO `ApiTodo` → `Task`, `getAll`, `getById`, `create`, `update`, `delete` |
| Server state    | `src/hooks/useTasks.ts`, `src/reducers/taskReducer.ts` | сторінка з API, `loading` / `success` / `error`, локальні зміни після mutation                 |
| Деталі          | `src/hooks/useTask.ts`                                 | `GET /todos/:id` у локальному state компонента                                                 |
| Client/UI state | `TaskProvider`                                         | поточна сторінка, фільтр (у `localStorage`), вибране завдання, toast                           |

- **Компоненти не містять URL і `fetch`.** Вони викликають дії з Context, а ті ідуть через `taskRepository`.
- **Пагінація.** Використано `limit` / `skip`, кнопки «Попередня» / «Наступна» та напис «Сторінка 2 з 26».
- **Стани запиту:**
  - «Loading...» під час завантаження;
  - «Помилка завантаження. [Спробувати ще]», якщо запит не вдався;
  - «Завдань не знайдено.», якщо список порожній;
  - toast-повідомлення про успіх після create, update і delete.
- **Скасування запитів.** Кожен GET списку й деталей отримує `AbortController.signal`. Cleanup effect скасовує попередній запит, коли змінюється сторінка або закриваються деталі. `AbortError` не показується як помилка.
- **CRUD:**
  - `POST /todos/add` з форми;
  - `PUT /todos/:id` для назви й `completed`, перемикання `completed` зроблено як optimistic update з відкотом при помилці;
  - `DELETE /todos/:id` після підтвердження «Видалити завдання …? Так / Ні».
- **Обмеження DummyJSON.** API лише імітує запис. Тому після успішної відповіді reducer пам'ятає створені, змінені й видалені завдання та накладає їх на кожну завантажену сторінку. Опис, категорія й пріоритет — client-only metadata, яких немає в контракті API (`toTask` ставить значення за замовчуванням). Завдання, створені в сесії, на сервері не існують, тому їх деталі й зміни не відправляються в API.
- **Server state vs client state.** Завдання більше не зберігаються в `localStorage`, там лишився тільки фільтр. Дані `Task` живуть в одному reducer, Context лише роздає їх компонентам.
- **Додаткові завдання:** optimistic update для `completed` і централізована нормалізація помилок (`src/utils/errors.ts`).

Тести (`npm test`) працюють з фейковим DummyJSON (`src/test/fakeApi.ts`), який підміняє `fetch`, тому в мережу вони не ходять.
