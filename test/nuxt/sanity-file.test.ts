import { expect, describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import SanityFile from '../../src/runtime/components/sanity-file'

describe('SanityFile', () => {
  it('provides a valid renderless component', () => {
    const wrapper = mount(SanityFile,
      {
        props: {
          assetId: 'file-41773b5c55bc5414ab7554a75eefddf8e2e14524-txt',
        },
        slots: {
          default: ({ src }) => h('a', { href: src }, 'Click here to read'),
        },
      },
    )

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('allows injecting download params', () => {
    const wrapper = mount(SanityFile,
      {
        props: {
          assetId: 'file-41773b5c55bc5414ab7554a75eefddf8e2e14524-txt',
          download: 'myfile.txt',
        },
        slots: {
          default: ({ src }) => h('a', { href: src }, 'Click here to download'),
        },
      },
    )

    expect(wrapper.html()).toMatchSnapshot()
  })
})
