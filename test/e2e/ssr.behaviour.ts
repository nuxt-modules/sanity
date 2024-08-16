import { $fetch } from '@nuxt/test-utils/e2e'
import { it, expect } from 'vitest'

export const ssrBehaviour = () => {
  it('Sanity image builder works', async () => {
    const html = await $fetch('/')
    expect(html).toContain(
      'https://cdn.sanity.io/images/j1o4tmjp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?auto=format&amp;w=128',
    )
  })

  it('Sanity config is exposed', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Project ID: j1o4tmjp')
  })

  it('auto-imports work in server routes', async () => {
    // TODO: investigate stack depth: https://github.com/unjs/nitro/issues/470
    expect(await $fetch<string>('/api/groq')).toContain('hey there')
    expect(await $fetch<string>('/api/fetch')).toEqual(expect.objectContaining({ slug: 'walle' }))
    expect(await $fetch<Record<string, any>>('/api/client')).toEqual(expect.objectContaining({
      projectId: 'j1o4tmjp',
    }))
  })

  it('CMS items are fetched', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Guardians of the Galaxy')
  })

  it('Can view single film page', async () => {
    const html = await $fetch('/movie/alien')
    expect(html).toContain('Arthur Dallas')
  })
}
