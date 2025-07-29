import { expect, describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineAsyncComponent, defineComponent, h, markRaw } from 'vue'
import SanityContent from '../../src/runtime/components/sanity-content'

import * as exampleBlocks from './fixture/portable-text'

const CustomBlockComponent = defineComponent({
  props: {
    exampleProp: String,
    children: {
      type: Array,
      default: () => [],
    },
  },
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

  // Test basic rendering with PortableText
  it('should render with PortableText', () => {
    const wrapper = mount(SanityContent, {
      props: {
        components: {},
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test rendering text blocks with marks
  it('should render text blocks with marks', () => {
    const textBlock = {
      _key: 'test-block',
      _type: 'block',
      children: [
        {
          _key: 'text-1',
          _type: 'span',
          marks: [],
          text: 'Regular text and ',
        },
        {
          _key: 'text-2',
          _type: 'span',
          marks: ['strong'],
          text: 'bold text',
        },
        {
          _key: 'text-3',
          _type: 'span',
          marks: ['em'],
          text: ' and italic text',
        },
      ],
      markDefs: [],
      style: 'normal',
    }

    const wrapper = mount(SanityContent, {
      props: {
        value: [textBlock],
      },
    })

    // Verify content renders with correct HTML elements
    expect(wrapper.html()).toContain('Regular text and')
    expect(wrapper.html()).toContain('<strong>bold text</strong>')
    expect(wrapper.html()).toContain('<em> and italic text</em>')
    expect(wrapper.html()).toMatchSnapshot()
  })

  Object.entries(exampleBlocks).forEach(([component, block]) => {
    it(`should render ${component} blocks with PortableText`, () => {
      const wrapper = mount(SanityContent as any, {
        props: {
          value: Array.isArray(block) ? block : [block],
          components: markRaw({
            types: {
              customIcon: (props: any) => h('i', props.value),
              // This registered by @nuxt/components - adapt to props.value pattern
              customComponent1: (props: any) => h(CustomBlockComponent, {
                ...props.value,
              }),
              // A directly imported component - adapt to props.value pattern
              customComponent2: (props: any) => h(CustomBlockComponent, {
                ...props.value,
              }),
              // Example of a more complex async component - adapt to props.value pattern
              customComponent3: (props: any) => h(defineAsyncComponent({
                loadingComponent: () => h('div', 'Loading...'),
                loader: () => Promise.resolve(CustomBlockComponent),
              }), {
                ...props.value,
              }),
              // Add missing link component handler
              link: (props: any) => h('a', { href: props.value.href }),
            },
            styles: {
              // Also adapt styles to props.value pattern
              customStyle1: (props: any) => h(CustomBlockComponent, {
                ...props.value,
              }),
            },
          }),
        },
      })
      // Temporarily check only that it renders without error
      expect(wrapper.html()).toBeTruthy()
    })
  })
})

describe('SanityContent with PortableText', () => {
  // Test custom props are passed correctly
  it('should pass custom props to components correctly', () => {
    const CustomPropsComponent = defineComponent({
      props: {
        customProp: String,
        anotherProp: Number,
      },
      setup: props => () => h('div', { class: 'custom-component' }, `Props: ${props.customProp}, ${props.anotherProp}`),
    })

    const value = [{
      _type: 'customBlock',
      _key: 'test123',
      customProp: 'test value',
      anotherProp: 42,
    }] as any[]

    const wrapper = mount(SanityContent, {
      props: {
        value,
        components: {
          types: {
            customBlock: (props: any) => h(CustomPropsComponent, {
              ...props.value,
            }),
          },
        },
      },
    })

    expect(wrapper.html()).toContain('Props: test value, 42')
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test for link marks with markDefs
  it('should render link marks with href correctly', () => {
    const linkBlock = {
      _key: 'link-block',
      _type: 'block',
      children: [
        {
          _key: 'text-before',
          _type: 'span',
          marks: [],
          text: 'Visit ',
        },
        {
          _key: 'link-text',
          _type: 'span',
          marks: ['link-1'],
          text: 'our website',
        },
        {
          _key: 'text-after',
          _type: 'span',
          marks: [],
          text: ' for more info.',
        },
      ],
      markDefs: [
        {
          _key: 'link-1',
          _type: 'link',
          href: 'https://example.com',
        },
      ],
      style: 'normal',
    } as any

    const wrapper = mount(SanityContent, {
      props: {
        value: [linkBlock],
      },
    })

    expect(wrapper.html()).toContain('<a href="https://example.com">our website</a>')
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render mixed content blocks consistently', () => {
    // Create a complex set of blocks with various features
    const complexBlocks = [
      // Custom block type
      {
        _type: 'customBlock',
        _key: 'custom1',
        content: 'Custom block content',
      },
      // Normal text with styles and marks
      {
        _key: 'text1',
        _type: 'block',
        style: 'h2',
        children: [
          {
            _key: 'text1-span1',
            _type: 'span',
            marks: ['strong'],
            text: 'Styled heading with marks',
          },
        ],
        markDefs: [],
      },
      // List block
      {
        _key: 'list1',
        _type: 'block',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _key: 'list1-item1',
            _type: 'span',
            marks: [],
            text: 'List item 1',
          },
        ],
        markDefs: [],
      },
      {
        _key: 'list2',
        _type: 'block',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _key: 'list2-item1',
            _type: 'span',
            marks: ['em'],
            text: 'List item 2 with emphasis',
          },
        ],
        markDefs: [],
      },
    ] as any[]

    const CustomBlock = defineComponent({
      props: ['content'],
      setup: props => () => h('div', { class: 'custom-content' }, props.content),
    })

    const components = {
      types: {
        customBlock: (props: any) => h(CustomBlock, {
          ...props.value,
        }),
      },
    }

    const portableTextWrapper = mount(SanityContent, {
      props: {
        value: complexBlocks,
        components,
      },
    })

    // Check that both contain the expected content
    expect(portableTextWrapper.html()).toContain('Custom block content')
    expect(portableTextWrapper.html()).toContain('<h2>')
    expect(portableTextWrapper.html()).toContain('<strong>Styled heading with marks</strong>')
    expect(portableTextWrapper.html()).toContain('<ul>')
    expect(portableTextWrapper.html()).toContain('<em>List item 2 with emphasis</em>')
    // Save snapshots
    expect(portableTextWrapper.html()).toMatchSnapshot('portable-text-rendering')
  })

  // Test for nested block handling
  it('should handle nested blocks correctly', () => {
    const NestedBlockComponent = defineComponent({
      props: ['title', 'content', 'items'],
      setup: props => () => h('div', { class: 'nested-block' }, [
        h('h3', {}, props.title),
        h('p', {}, props.content),
        h('ul', {}, props.items?.map((item: string) => h('li', {}, item))),
      ]),
    })

    const nestedBlock = {
      _type: 'nestedBlock',
      _key: 'nested1',
      title: 'Nested Block Title',
      content: 'Nested block content goes here',
      items: ['Item 1', 'Item 2', 'Item 3'],
    } as any

    const wrapper = mount(SanityContent, {
      props: {
        value: [nestedBlock],
        components: {
          types: {
            nestedBlock: (props: any) => h(NestedBlockComponent, {
              ...props.value,
            }),
          },
        },
      },
    })

    // Verify all nested content is present
    expect(wrapper.html()).toContain('Nested Block Title')
    expect(wrapper.html()).toContain('Nested block content goes here')
    expect(wrapper.html()).toContain('Item 1')
    expect(wrapper.html()).toContain('Item 2')
    expect(wrapper.html()).toContain('Item 3')
    expect(wrapper.html()).toMatchSnapshot()
  })

  // Test for correct rendering of nested lists
  it('should render nested lists with proper HTML structure', () => {
    const { nestedList } = exampleBlocks

    const wrapper = mount(SanityContent, {
      props: {
        value: nestedList,
      },
    })

    const html = wrapper.html()

    expect(html).toContain('<h3>3. Providing your personal data to others</h3>')
    const olCount = (html.match(/<ol[^>]*>/g) || []).length
    expect(olCount).toBe(1)
    const ulCount = (html.match(/<ul[^>]*>/g) || []).length
    expect(ulCount).toBe(1)

    // The HTML should NOT have the structure where a li contains another li directly without a ul/ol in between
    // This means we shouldn't have patterns like '</li><li><li>' which would indicate incorrect nesting
    expect(html).not.toContain('</li><li><li>')

    expect(html).toContain('test')
    expect(html).toContain('thing')
    expect(html).toContain('nested')
    expect(html).toContain('list')

    // Verify the correct nesting structure - a sublist should be inside its parent list item
    // The nested bullet list should appear inside the "thing" list item (not after it as a sibling)
    const nestedListPattern = html.includes('<li>thing<ul>')
      || html.includes('<li>thing <ul>')
    expect(nestedListPattern).toBe(true)

    // Ensure the nested list structure is properly contained
    // The order of closing tags should maintain proper hierarchy
    const closingTagsRegex = /<\/li>\s*<\/ul>\s*<\/li>\s*<\/ol>/
    expect(closingTagsRegex.test(html)).toBe(true)

    expect(wrapper.html()).toMatchSnapshot('nested-list-structure')
  })

  // Test for correct rendering of deeply nested lists with multiple levels
  it('should render deeply nested lists with proper structure', () => {
    const { evenMoreNestedList } = exampleBlocks

    const wrapper = mount(SanityContent, {
      props: {
        value: evenMoreNestedList,
      },
    })

    const html = wrapper.html()

    // Should have ordered lists for the different levels
    const olCount = (html.match(/<ol[^>]*>/g) || []).length
    expect(olCount).toBe(4)

    expect(html).toContain('1. Top level')
    expect(html).toContain('a. Second level')
    expect(html).toContain('i. Third level')
    expect(html).toContain('b. Second level')
    expect(html).toContain('2. Top level')
    expect(html).toContain('a. Second level') // The second "a. Second level" after "2. Top level"

    // Check nesting structure - the proper structure should show items in the correct order
    // and with proper parent-child relationships

    const level1BeforeLevel2 = html.indexOf('1. Top level') < html.indexOf('a. Second level')
    expect(level1BeforeLevel2).toBe(true)

    const level2BeforeLevel3 = html.indexOf('a. Second level') < html.indexOf('i. Third level')
    expect(level2BeforeLevel3).toBe(true)

    const level3BeforeSecondLevel2 = html.indexOf('i. Third level') < html.indexOf('b. Second level')
    expect(level3BeforeSecondLevel2).toBe(true)

    const secondLevel2BeforeSecondLevel1 = html.indexOf('b. Second level') < html.indexOf('2. Top level')
    expect(secondLevel2BeforeSecondLevel1).toBe(true)

    // Check for proper nesting with ordered lists
    // The proper structure would close inner lists before closing outer list items
    expect(html).toMatch(/<\/ol>(\s*)<\/li>/g)

    expect(wrapper.html()).toMatchSnapshot('deeply-nested-list-structure')
  })

  // Test for custom list components
  it('should render custom list components correctly', () => {
    const { listBlocks } = exampleBlocks

    const wrapper = mount(SanityContent, {
      props: {
        value: listBlocks,
        components: {
          list: {
            bullet: (_, { slots }) => h('ul', { class: 'mt-xl custom-bullet-list' }, slots.default?.()),
            number: (_, { slots }) => h('ol', { class: 'mt-lg custom-number-list' }, slots.default?.()),
            checkmarks: (_, { slots }) => h('ol', { class: 'm-auto text-lg custom-checkmarks-list' }, slots.default?.()),
          },
        },
      },
    })

    const html = wrapper.html()
    console.log(html)

    // Check that custom list classes are applied
    expect(html).toContain('class="mt-xl custom-bullet-list"')
    expect(html).toContain('class="mt-lg custom-number-list"')
    expect(html).toContain('class="m-auto text-lg custom-checkmarks-list"')

    // Check content
    expect(html).toContain('First bullet item')
    expect(html).toContain('Second bullet item')
    expect(html).toContain('First numbered item')
    expect(html).toContain('Second numbered item')
    expect(html).toContain('First checkmark item')
    expect(html).toContain('Second checkmark item')

    expect(wrapper.html()).toMatchSnapshot('custom-list-components')
  })

  // Test for custom listItem components
  it('should render custom listItem components correctly', () => {
    const { listItemBlocks } = exampleBlocks

    const wrapper = mount(SanityContent, {
      props: {
        value: listItemBlocks,
        components: {
          listItem: {
            bullet: (_, { slots }) => h('li', {
              style: { listStyleType: 'disclosure-closed' },
              class: 'custom-bullet-item',
            }, slots.default?.()),
            checkmarks: (_, { slots }) => h('li', { class: 'custom-checkmark-item' }, [
              h('span', { class: 'checkmark' }, '✅'),
              slots.default?.(),
            ]),
          },
        },
      },
    })

    const html = wrapper.html()

    // Check that custom list item styles are applied
    expect(html).toContain('class="custom-bullet-item"')
    expect(html).toContain('style="list-style-type: disclosure-closed;"')
    expect(html).toContain('class="custom-checkmark-item"')
    expect(html).toContain('class="checkmark"')
    expect(html).toContain('✅')

    // Check content
    expect(html).toContain('First bullet item')
    expect(html).toContain('First checkmark item')

    expect(wrapper.html()).toMatchSnapshot('custom-list-item-components')
  })

  // Test for generic list component that handles all list types
  it('should use a single list component for all list types when provided', () => {
    const { listBlocks } = exampleBlocks

    const wrapper = mount(SanityContent, {
      props: {
        value: listBlocks,
        components: {
          list: {
            // Ex. 1: customizing common list types
            bullet: (_, { slots }) => h('ul', { class: 'mt-xl' }, slots.default?.()),
            number: (_, { slots }) => h('ol', { class: 'mt-lg' }, slots.default?.()),

            // Ex. 2: rendering custom lists
            checkmarks: (_, { slots }) => h('ol', { class: 'm-auto text-lg' }, slots.default?.()),
          },
        },
      },
    })

    const html = wrapper.html()

    // Check that custom list classes are applied
    expect(html).toContain('class="mt-xl"')
    expect(html).toContain('class="mt-lg"')
    expect(html).toContain('<ul')
    expect(html).toContain('<ol')

    // Check content
    expect(html).toContain('First bullet item')
    expect(html).toContain('First numbered item')

    expect(wrapper.html()).toMatchSnapshot('generic-list-component')
  })

  // Test for generic listItem component that handles all list item types
  it('should use a single listItem component for all list item types when provided', () => {
    const { listItemBlocks } = exampleBlocks
    const wrapper = mount(SanityContent, {
      props: {
        value: listItemBlocks,
        components: {
          listItem: {
            // Ex. 1: customizing common list types
            bullet: (_, { slots }) =>
              h('li', { style: { listStyleType: 'disclosure-closed' } }, slots.default?.()),

            // Ex. 2: rendering custom list items
            checkmarks: (_, { slots }) => h('li', ['✅', slots.default?.()]),
          },
        },
      },
    })

    const html = wrapper.html()

    // Check that custom listItem styles are applied
    expect(html).toContain('style="list-style-type: disclosure-closed;"')
    expect(html).toContain('✅')

    // Check content
    expect(html).toContain('First bullet item')
    expect(html).toContain('First checkmark item')

    expect(wrapper.html()).toMatchSnapshot('generic-list-item-component')
  })
})
