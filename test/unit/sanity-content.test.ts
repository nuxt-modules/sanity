/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils'

import { SanityContent } from '../../src/components/sanity-content'

type ExampleBlock = { _type: string; [key: string]: any }

const exampleBlocks: Record<string, ExampleBlock | ExampleBlock[]> = {
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
  list: [
    {
      _type: 'block',
      _key: 'a6cec1a2a738',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'b39d8ec32f27',
          text: 'test',
          marks: [],
        },
      ],
      level: 1,
      listItem: 'number',
    },
    {
      _type: 'block',
      _key: '5917a3f6485d',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'aaa0e0ab720a',
          text: 'thing',
          marks: [],
        },
      ],
      level: 1,
      listItem: 'number',
    },
  ],
  nestedList: [
    {
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
    {
      _type: 'block',
      _key: 'a6cec1a2a738',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'b39d8ec32f27',
          text: 'test',
          marks: [],
        },
      ],
      level: 1,
      listItem: 'number',
    },
    {
      _type: 'block',
      _key: '5917a3f6485d',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'aaa0e0ab720a',
          text: 'thing',
          marks: [],
        },
      ],
      level: 1,
      listItem: 'number',
    },
    {
      _type: 'block',
      _key: 'ceaddc3e7d34',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: '62d7844aaf8e',
          text: 'nested',
          marks: [],
        },
      ],
      level: 2,
      listItem: 'bullet',
    },
    {
      _type: 'block',
      _key: '415d8fb2fa1e',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'a7705718303a',
          text: 'list',
          marks: [],
        },
      ],
      level: 2,
      listItem: 'bullet',
    },
  ],
  blockquote: {
    _key: 'd810da8ac845',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8450',
        _type: 'span',
        marks: [],
        text: 'Build your next Vue.js application with confidence using ',
      },
      {
        _key: 'd810da8ac8451',
        _type: 'span',
        marks: [
          'c9c6224401ba',
        ],
        text: 'NuxtJS',
      },
      {
        _key: 'd810da8ac8452',
        _type: 'span',
        marks: [],
        text: '. An open source framework making web development simple and powerful.',
      },
    ],
    markDefs: [
      {
        _key: 'c9c6224401ba',
        _type: 'link',
        href: 'https://nuxtjs.org',
      },
    ],
    style: 'blockquote',
  },
  strong: {
    _key: 'd810da8ac845',
    _type: 'block',
    children: [
      {
        _key: 'd810da8ac8450',
        _type: 'span',
        marks: [],
        text: 'An example of ',
      },
      {
        _key: '7dc51c030a2f',
        _type: 'span',
        marks: [
          'strong',
        ],
        text: 'bold',
      },
      {
        _key: '794714489c2d',
        _type: 'span',
        marks: [],
        text: ' text and ',
      },
      {
        _key: '23487f',
        _type: 'span',
        marks: [
          'strong',
        ],
        text: 'another',
      },
      {
        _key: '230498a',
        _type: 'span',
        marks: [],
        text: '.',
      },
    ],
    markDefs: [],
    style: 'normal',
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
          blocks: Array.isArray(block) ? block : [block],
        },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})
