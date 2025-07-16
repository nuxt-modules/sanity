// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
      './docs',
    ],
  },
}).append(
  {
    files: ['test/**', 'playground/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['docs/**', 'playground/**'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
