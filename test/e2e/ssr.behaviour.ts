import { $fetch } from '@nuxt/test-utils'
import { it, expect } from 'vitest'

export const ssrBehaviour = () => {
  it('Sanity image builder works', async () => {
    const html = await $fetch('/')
    expect(html).toContain(
      'https://cdn.sanity.io/images/j1o4tmjp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?auto=format&amp;w=128',
    )
  }, 50000)

  it('Sanity config is exposed', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Project ID: j1o4tmjp')
  }, 50000)

  it('CMS items are fetched', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Guardians of the Galaxy')
  }, 50000)

  it('Can view single film page', async () => {
    const html = await $fetch('/movie/alien')
    expect(html).toContain('Arthur Dallas')
  }, 50000)
}
