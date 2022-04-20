import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '#imports': fileURLToPath(new URL('./test/stubs/imports.mjs', import.meta.url)),
    },
  },
  test: {
    coverage: {
      reporter: ['text'],
    },
    environment: 'happy-dom',
  },
})
