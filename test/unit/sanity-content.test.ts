import { expect, describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, defineComponent, h, markRaw } from 'vue'
import SanityContent from '../../src/runtime/components/sanity-content'

import * as exampleBlocks from './fixture/portable-text'

const CustomBlockComponent = defineComponent({
  props: { exampleProp: String },
  setup: (props, { slots }) => () => h('div', {}, {
    default: () => [
      props.exampleProp,
      slots.default?.(),
    ],
  }),
})

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
          serializers: markRaw({
            types: {
              customIcon: 'i',
              // This is how to access a component registered by `@nuxt/components`
              customComponent1: CustomBlockComponent,
              // A directly imported component
              customComponent2: CustomBlockComponent,
              // Example of a more complex async component
              customComponent3: defineAsyncComponent({
                loadingComponent: () => h('div', 'Loading...'),
                loader: () => Promise.resolve(CustomBlockComponent),
              }),
            },
          }),
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
