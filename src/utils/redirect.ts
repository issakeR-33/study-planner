// приймаємо лише внутрішні шляхи, щоб ?redirect= не вів на сторонній сайт
export function safeRedirect(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null
}
