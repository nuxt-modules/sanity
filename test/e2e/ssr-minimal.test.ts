/* @vitest-environment node */
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { describe } from 'vitest'
import { ssrBehaviour } from './ssr.behaviour'

await setup({
  server: true,
  rootDir: fileURLToPath(new URL('../../playground', import.meta.url)),
  nuxtConfig: {
    imports: {
      autoImport: true,
    },
    sanity: {
      projectId: 'j1o4tmjp',
      minimal: true,
    },
  },
})

describe('module with minimal client', () => {
  ssrBehaviour()
})
