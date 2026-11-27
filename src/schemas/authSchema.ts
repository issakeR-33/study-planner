import { z } from 'zod'

// Мінімальна довжина пароля - навчальна перевірка форми, а не правило безпеки
export const PASSWORD_MIN_LENGTH = 6

export const loginSchema = z.object({
  username: z.string().trim().min(1, { error: "Введіть ім'я користувача" }),
  password: z
    .string()
    .min(1, { error: 'Введіть пароль' })
    .min(PASSWORD_MIN_LENGTH, { error: `Пароль щонайменше з ${PASSWORD_MIN_LENGTH} символів` }),
})

export type LoginFormData = z.infer<typeof loginSchema>
