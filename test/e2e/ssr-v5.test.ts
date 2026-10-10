/* @vitest-environment node */
import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { describe } from 'vitest'
import { ssrBehaviour } from './ssr.behaviour'

await setup({
  server: true,
  rootDir: fileURLToPath(new URL('../../playground-v5', import.meta.url)),
})

describe('module with default options (nuxt 5)', () => {
  ssrBehaviour()
})
