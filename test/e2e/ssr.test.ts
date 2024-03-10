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
    // @ts-expect-error issue with types in non-hoisted repo
    sanity: {
      projectId: 'j1o4tmjp',
    },
  },
})

describe('module with default options', () => {
  ssrBehaviour()
})
