import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import SanityImageBase from '../../src/runtime/components/sanity-image-base'
import { SanityImage } from '#components'

const projectId = 'test-project'

const getWrapper = (propsData: Record<string, any>) =>
  mount(SanityImageBase, {
    propsData: {
      projectId,
      ...propsData,
    },
  })

describe('SanityImage base component', () => {
  it('parses asset IDs correctly', () => {
    const wrapper = getWrapper({
      assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
    })

    expect(wrapper.attributes().src).toBe(
      `https://cdn.sanity.io/images/${projectId}/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg`,
    )
  })

  it('correctly adds query params', () => {
    const wrapper = getWrapper({
      assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      w: 20,
      h: '21',
    })

    expect(wrapper.attributes().src).toBe(
      `https://cdn.sanity.io/images/${projectId}/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?h=21&w=20`,
    )
  })

  it('provides a valid renderless component', () => {
    const wrapper = mount(SanityImageBase,
      {
        props: {
          assetId: 'image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg',
          auto: 'format',
          fpX: 0.5,
        },
        slots: {
          default: ({ src }) => h('img', { src }),
        },
      },
    )

    expect(wrapper.html()).toMatchSnapshot()
  })
})

describe('SanityImage prop validation', () => {
  const failures: [string, any[]][] = [
    ['auto', [-200, 200]],
    ['bg', [-200, 200]],
    ['blur', [-200, 200]],
    ['crop', [-200, 200]],
    ['dl', [-200, 200]],
    ['dpr', [-200, 200]],
    ['fit', [-200, 200]],
    ['flip', [-200, 200]],
    ['fm', [-200, 200]],
    ['fpX', [-200, 200]],
    ['fpY', [-200, 200]],
    ['h', [false]],
    ['invert', [-200, 200]],
    ['maxH', [false]],
    ['maxW', [false]],
    ['minH', [false]],
    ['minW', [false]],
    ['or', [-200, 200]],
    ['q', [200, '200']],
    ['rect', [-200, 200]],
    ['sat', [false]],
    ['sharpen', [-200, 200]],
    ['w', [false]],
  ]

  let mockError: Console['warn']

  beforeEach(() => {
    mockError = vi.fn()

    console.warn = mockError
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  failures.forEach(([key, values]) => {
    it(`fails for ${key}`, () => {
      values.forEach((value) => {
        getWrapper({
          assetId:
            'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
          [key]: value,
        })
        expect(mockError).toHaveBeenCalled()
      })
    })
  })

  const validOptions: [string, any[]][] = [
    ['crop', ['top']],
    ['fit', ['clip']],
    ['flip', ['h']],
    ['fm', ['jpg']],
    ['or', [270]],
  ]

  validOptions.forEach(([key, values]) => {
    it(`succeeds for ${key}`, () => {
      values.forEach((value) => {
        getWrapper({
          assetId:
            'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
          [key]: value,
        })
        expect(mockError).toHaveBeenCalledTimes(0)
      })
    })
  })
})

/**
 * Tests for SanityImage component when @nuxt/image IS available.
 * This tests the NuxtImg-based component behavior (sanity-image-nuxt).
 */
describe('SanityImage with @nuxt/image', () => {
  it('renders NuxtImg component', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      },
    })

    // Should render NuxtImg when @nuxt/image is available
    expect(wrapper.findComponent({ name: 'NuxtImg' }).exists()).toBe(true)
  })

  it('passes sanity provider to NuxtImg', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      },
    })

    const nuxtImg = wrapper.findComponent({ name: 'NuxtImg' })
    expect(nuxtImg.props('provider')).toBe('sanity')
  })

  it('passes assetId as src to NuxtImg', async () => {
    const assetId = 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg'
    const wrapper = await mountSuspended(SanityImage, {
      props: { assetId },
    })

    const nuxtImg = wrapper.findComponent({ name: 'NuxtImg' })
    expect(nuxtImg.props('src')).toBe(assetId)
  })

  it('passes modifiers to NuxtImg', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
        auto: 'format',
        q: 80,
      },
    })

    const nuxtImg = wrapper.findComponent({ name: 'NuxtImg' })
    const modifiers = nuxtImg.props('modifiers')
    expect(modifiers).toMatchObject({
      auto: 'format',
      q: 80,
    })
  })

  it('passes width and height as top-level props', async () => {
    const wrapper = await mountSuspended(SanityImage, {
      props: {
        assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
        w: 200,
        h: 300,
      },
    })

    const nuxtImg = wrapper.findComponent({ name: 'NuxtImg' })
    expect(nuxtImg.props('width')).toBe(200)
    expect(nuxtImg.props('height')).toBe(300)
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

    // When scoped slot is used, should render custom content instead of NuxtImg
    const img = wrapper.find('img.custom-image')
    expect(img.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NuxtImg' }).exists()).toBe(false)
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

    const nuxtImg = wrapper.findComponent({ name: 'NuxtImg' })
    expect(nuxtImg.attributes('alt')).toBe('Test image')
    expect(nuxtImg.attributes('class')).toBe('my-image')
  })
})
