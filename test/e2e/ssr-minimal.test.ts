/* @vitest-environment node */
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils'
import { describe } from 'vitest'
import { ssrBehaviour } from './ssr.behaviour'

describe('module with minimal client', async () => {
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

  ssrBehaviour()
})
