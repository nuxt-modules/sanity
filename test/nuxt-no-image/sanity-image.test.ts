import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { SanityImage } from '#components'

/**
 * Tests for SanityImage component when @nuxt/image is NOT available.
 * This tests the base component behavior (sanity-image-base).
 */
describe('SanityImage without @nuxt/image', () => {
  it('renders a native img element', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      },
    })

    // Should render a native img element, not NuxtImg
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NuxtImg' }).exists()).toBe(false)
  })

  it('generates correct Sanity CDN URL', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      },
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(
      'https://cdn.sanity.io/images/test-project/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg',
    )
  })

  it('includes query params in URL', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
        w: 128,
        auto: 'format',
      },
    })

    const img = wrapper.find('img')
    const src = img.attributes('src')
    expect(src).toContain('w=128')
    expect(src).toContain('auto=format')
  })

  it('supports scoped slot for custom rendering', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg',
      },
      slots: {
        default: `<template #default="{ src }"><img :src="src" class="custom-image" /></template>`,
      },
    })

    const img = wrapper.find('img.custom-image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('cdn.sanity.io')
  })

  it('passes through additional attributes', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      },
      attrs: {
        alt: 'Test image',
        class: 'my-image',
      },
    })

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('Test image')
    expect(img.attributes('class')).toBe('my-image')
  })
})
