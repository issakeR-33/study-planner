/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // відносні шляхи, щоб збірку можна було розгорнути на GitHub Pages у підпапці
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // тести не ходять у мережу: fetch підміняється, адреса API фіктивна
    env: { VITE_API_URL: 'https://api.test' },
  },
})
