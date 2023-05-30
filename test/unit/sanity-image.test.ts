import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'

import SanityImage from '../../src/runtime/components/sanity-image'

const projectId = 'test-project'

const getWrapper = (propsData: Record<string, any>) =>
  mount(SanityImage, {
    propsData: {
      projectId,
      ...propsData,
    },
  })

describe('SanityImage', () => {
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
    const wrapper = mount(SanityImage,
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
    // eslint-disable-next-line no-console
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
