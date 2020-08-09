import { mount } from '@vue/test-utils'

import { SanityContent } from '../../src/components/sanity-content'

const exampleBlocks: Record<string, { _type: string; [key: string]: any }> = {
  link: {
    _type: 'link',
    href: 'http://test.com/',
  },
  heading: {
    _key: 'b1905c55df85',
    _type: 'block',
    children: [
      {
        _key: 'b1905c55df850',
        _type: 'span',
        marks: [],
        text: '3. Providing your personal data to others',
      },
    ],
    markDefs: [],
    style: 'h3',
  },
  exampleMarkDefs: {
    _key: '3522a2a863b9',
    _type: 'block',
    children: [
      {
        _key: '3522a2a863b90',
        _type: 'span',
        marks: ['strong'],
        text: 'Google Analytics',
      },
      {
        _key: '3522a2a863b91',
        _type: 'span',
        marks: [],
        text:
          ': The Sites use Google Analytics. Further information is available at ',
      },
      {
        _key: '3522a2a863b92',
        _type: 'span',
        marks: ['71968b05862f'],
        text: 'https://tools.google.com/dlpage/gaoptout/',
      },
      {
        _key: '3522a2a863b93',
        _type: 'span',
        marks: [],
        text: '.',
      },
    ],
    level: 2,
    listItem: 'bullet',
    markDefs: [
      {
        _key: '71968b05862f',
        _type: 'link',
        href: 'https://tools.google.com/dlpage/gaoptout/',
      },
    ],
    style: 'normal',
  },
}

describe('SanityContent', () => {
  it('should render with no props', () => {
    const wrapper = mount(SanityContent)
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with non-standard props', () => {
    const wrapper = mount(SanityContent, {
      propsData: {
        serializers: { container: 'section' },
        class: 'customClass',
        blocks: null,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  Object.entries(exampleBlocks).forEach(([component, block]) => {
    it(`should render ${component} blocks`, () => {
      const wrapper = mount(SanityContent, {
        propsData: {
          blocks: [block],
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
