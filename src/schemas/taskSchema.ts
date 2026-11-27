import { z } from 'zod'

export const TITLE_MAX = 100

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Вкажіть назву завдання' })
    .max(TITLE_MAX, { error: `Не більше ${TITLE_MAX} символів` }),
  description: z.string().trim().max(500, { error: 'Не більше 500 символів' }),
  category: z.string().trim().max(40, { error: 'Не більше 40 символів' }),
  priority: z.enum(['low', 'medium', 'high'], { error: 'Оберіть пріоритет' }),
})

export type TaskFormData = z.infer<typeof taskSchema>
