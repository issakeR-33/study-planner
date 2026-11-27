# Study Planner

Навчальний планувальник завдань на React 19 + TypeScript.
Спільний застосунок для лабораторних 8–11 з курсу «Інженерія клієнтських веб-систем».

| Лабораторна | Гілка                        | Тема                                                         |
| ----------- | ---------------------------- | ------------------------------------------------------------ |
| №8          | `feature/react-fundamentals` | компоненти, JSX, props, `useState`, події, списки            |
| №9          | `feature/state-effects`      | `useReducer`, Context API, `useEffect`, custom hooks         |
| №10         | `feature/rest-api`           | REST API, Repository, async states, CRUD                     |
| №11         | `feature/routing-auth`       | React Router 8 (Data Mode), форми, валідація, автентифікація |

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

## Лабораторна №11: React Router, форми та автентифікація

Варіант непарний, тому маршрутизація зроблена в **Data Mode**: `createBrowserRouter` + `RouterProvider`, захищений маршрут через `loader` + `redirect`.

### Маршрути (`src/routes/routes.tsx`)

| Шлях             | Сторінка             | Доступ                                              |
| ---------------- | -------------------- | --------------------------------------------------- |
| `/`              | redirect на `/tasks` | усі                                                 |
| `/tasks`         | `TasksPage`          | усі; `?status=`, `?priority=`, `?page=` у URL       |
| `/tasks/:taskId` | `TaskDetailsPage`    | усі; дії «Редагувати» / «Видалити» лише після входу |
| `/login`         | `LoginPage`          | лише гості (`guestOnlyLoader`)                      |
| `/profile`       | `ProfilePage`        | лише авторизовані (`requireAuthLoader`)             |
| `*`              | `NotFoundPage`       | усі                                                 |

`AppLayout` — батьківський маршрут з Header, навігацією (`NavLink`: Tasks, Profile, Login / Logout) і `<Outlet />`.

### Що зроблено

- **Route params:** `TaskDetailsPage` бере `taskId` через `useParams()` і завантажує завдання через `taskRepository.getById`. На сторінці показано назву, опис, категорію, пріоритет, стан, `createdBy` і `createdAt`.
- **`createdBy` / `createdAt`** входять у domain-модель `Task`. DummyJSON віддає лише `userId`, тому `createdBy` для завдань з API — `user #<userId>`, а `createdAt` — client-owned metadata: його ставить клієнт при створенні, для завдань з сервера він `null` (позначено в `src/types/task.ts`).
- **Query params:** фільтри за станом і пріоритетом та номер сторінки живуть лише в URL (`useTaskFilters`, `useSearchParams`), окремого state для них немає. Після оновлення сторінки фільтри зберігаються.
- **`TaskFormDialog`:** одна форма для двох режимів, `create` (кнопка `+` на `/tasks`) і `edit` (кнопка «Редагувати» на деталях). React Hook Form + Zod (`src/schemas/taskSchema.ts`). Поки йде запит, кнопка заблокована («Збереження...»). Діалог має заголовок (`aria-labelledby`), ставить фокус у поле назви, закривається клавішею Escape і кнопкою «Скасувати».
- **Login:** React Hook Form + Zod (`src/schemas/authSchema.ts`): username обов'язковий, пароль від 6 символів. Помилки показуються біля полів, помилка сервера — над формою. Після входу користувач повертається на сторінку з `?redirect=`.
- **Auth Context** (`src/context/AuthProvider.tsx`): `user`, `accessToken`, `isAuthenticated`, `login`, `logout`. `POST /auth/login` дає токени, `GET /auth/me` на сторінці профілю перевіряє токен.
- **Сесія** (`src/auth/session.ts`) лежить поза React, щоб її могли читати loader-и роутера й HTTP-клієнт без hooks. Вона зберігається в `localStorage` і відновлюється після перезавантаження.
- **Authorization header** формується в одному місці, у `src/api/httpClient.ts` (опція `auth: true`). Його отримують POST, PUT, DELETE і `/auth/me`. На відповідь 401 сесія закінчується.
- **Authorization для CRUD:** гість, який натискає `+`, «Редагувати», «Видалити» чи галочку, потрапляє на Login (`useRequireAuth`). Крім того, `TaskProvider` перед кожною зміною ще раз перевіряє сесію, тож захист не тримається лише на прихованих кнопках.
- **Profile:** username, email, статус авторизації, кнопка Logout. Після Logout `/profile` знову закритий.
- **Додатково:** повернення на попередню сторінку після входу, відновлення сесії після перезавантаження, окрема сторінка 404.

### Структура після №11

```
src/
  api/          httpClient.ts (Bearer-токен з сесії)
  auth/         session.ts (сесія поза React)
  context/      AuthProvider, authContext, TaskProvider, taskContext
  hooks/        useAuth, useRequireAuth, useTaskFilters, useTasks, useTask, useTaskContext
  layouts/      AppLayout
  pages/        TasksPage, TaskDetailsPage, LoginPage, ProfilePage, NotFoundPage
  repositories/ taskRepository, authRepository
  routes/       routes.tsx (конфігурація), loaders.ts (protected loader), router.ts
  schemas/      authSchema, taskSchema (Zod)
  components/   TaskFormDialog, TaskList, TaskItem, TaskFilters, TaskPagination, TaskStats, Toast, Header
```
