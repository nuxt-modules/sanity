/* @vitest-environment node */
import { fileURLToPath } from 'node:url'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { useNuxt } from '@nuxt/kit'

const serverHandlers: string[] = []

await setup({
  server: true,
  rootDir: fileURLToPath(new URL('../../playground-v5', import.meta.url)),
  nuxtConfig: {
    sanity: {
      visualEditing: {
        token: 'test-token',
      },
    },
    hooks: {
      'modules:done'() {
        serverHandlers.push(...useNuxt().options.serverHandlers.map(h => h.handler))
      },
    },
  },
})

describe('preview and proxy routes (nuxt 5)', () => {
  it('registers the portable server handlers', () => {
    const moduleHandlers = serverHandlers.filter(h => h.includes('/server/routes/preview/'))
    expect(moduleHandlers).toHaveLength(3)
    for (const handler of moduleHandlers) {
      expect(handler).toMatch(/\.portable$/)
    }
  })

  it('disables preview mode and redirects', async () => {
    const res = await fetch('/preview/disable?redirect=/movie/alien', { redirect: 'manual' })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/movie/alien')
    expect(res.headers.get('set-cookie')).toContain('sanity-preview-id=;')
  })

  it('rejects enabling preview mode without a valid secret', async () => {
    const res = await fetch('/preview/enable', { redirect: 'manual' })
    expect(res.status).toBe(401)
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('rejects proxied preview queries without a preview cookie', async () => {
    const res = await fetch('/_sanity/visual-editing/fetch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '*[_type == "movie"]' }),
    })
    expect(res.status).toBe(403)
  })

  it('validates queries found in the app', async () => {
    const result = await $fetch<{ valid: boolean, files: string[] }>('/api/validate', {
      method: 'POST',
      body: { query: '*[_type == "movie"] { title, "poster": poster.asset._ref, "slug": slug.current }' },
    })
    expect(result.valid).toBe(true)
    expect(result.files).toEqual(expect.arrayContaining(['app/pages/index.vue', 'app/pages/movie/[slug].vue']))
  })

  it('rejects queries not found in the app', async () => {
    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '*' }),
    })
    expect(res.status).toBe(400)
  })
})
