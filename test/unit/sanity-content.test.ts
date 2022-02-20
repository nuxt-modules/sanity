import { expect, describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SanityContent from '../../src/runtime/components/sanity-content'

import * as exampleBlocks from './fixture/portable-text'

describe('SanityContent', () => {
  it('should render with no props', () => {
    const wrapper = mount(SanityContent)
    expect(wrapper.html()).toMatchSnapshot()
  })

  Object.entries(exampleBlocks).forEach(([component, block]) => {
    it(`should render ${component} blocks`, () => {
      const wrapper = mount(SanityContent as any, {
        props: {
          blocks: Array.isArray(block) ? block : [block],
          serializers: {
            types: { customIcon: 'i' },
          },
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
