import { defu } from 'defu'
import { Component, defineComponent, h, VNode } from 'vue'
import type {
  PortableTextBlock,
  ArbitraryTypedObject,
  PortableTextListItemBlock,
  PortableTextSpan,
  PortableTextMarkDefinition,
} from '@portabletext/types'

import { isVue2 } from '#imports'

type Serializer = Component | string
type Block = PortableTextBlock | PortableTextListItemBlock | ArbitraryTypedObject
type Children = undefined | VNode | string | Array<VNode | string>

export interface Serializers {
  /** block components or elements that render non-blocks */
  types?: Record<string, Serializer>
  /** inline components or elements */
  marks?: Record<string, Serializer>
  /** block components or elements that wrap blocks instead of `<p>` tags */
  styles?: Record<string, Serializer>
  listItem?: Serializer
  container?: Serializer
}

const isSpan = (block: Block): block is PortableTextSpan => block._type === 'span'

const defaults: Required<Serializers> = {
  types: {
    span: 'span',
    image: 'img',
  },
  marks: {
    strong: 'strong',
    em: 'em',
    link: 'a',
  },
  styles: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    normal: 'p',
    blockquote: 'blockquote',
  },
  listItem: 'li',
  container: 'div',
}

const validAttrs = [
  'abbr',
  'accesskey',
  'accessKey',
  'action',
  'alt',
  'autocomplete',
  'autofocus',
  'autoplay',
  'charset',
  'checked',
  'cite',
  'cols',
  'colspan',
  'command',
  'content',
  'datetime',
  'default',
  'disabled',
  'download',
  'draggable',
  'dropzone',
  'headers',
  'height',
  'hidden',
  'href',
  'hreflang',
  'id',
  'maxlength',
  'minlength',
  'muted',
  'placeholder',
  'preload',
  'radiogroup',
  'readonly',
  'required',
  'role',
  'selected',
  'src',
  'srcdoc',
  'srcset',
  'tabindex',
  'title',
  'value',
  'width',
  'wrap',
]

function findSerializer (item: Block | undefined, serializers: Required<Serializers>): Serializer | undefined {
  if (item?.listItem && item._type !== 'list') {
    return serializers.listItem || 'li'
  }

  return item?._type ? serializers.types[item._type] || serializers.marks[item._type] : undefined
}

function renderStyle ({ style, listItem }: Block, serializers: Required<Serializers>, children?: () => Children) {
  if (!listItem && style && serializers.styles[style]) {
    return h(serializers.styles[style] as any, null, isVue2 ? children?.() : { default: children })
  }

  return children?.()
}

function renderInSerializer (item: Block, serializers: Required<Serializers>) {
  return render(serializers, item, () => (item.children || []).map((child) => {
    if (isSpan(child)) {
      return renderMarks(child.text, child.marks, serializers, item.markDefs)
    }
    return render(serializers, child, () => renderMarks(child.text, child.marks, serializers, item.markDefs))
  }))
}

function renderMarks (
  content: Children,
  [mark, ...marks]: PortableTextBlock['children'][number]['marks'] = [],
  serializers: Required<Serializers>,
  markDefs: PortableTextMarkDefinition[] = [],
): Children {
  if (!mark) return content

  const definition = mark in serializers.marks ? { _type: mark, _key: '' } : markDefs.find(m => m._key === mark)
  return render(serializers, definition, () => renderMarks(content, marks, serializers, markDefs))
}

function walkList (blocks: Array<Block>, block: Block) {
  // Not a list item
  if (!block.listItem) {
    blocks.push(block)
    return blocks
  }

  const lastBlock = blocks[blocks.length - 1] || {}

  // Start a new list
  if (lastBlock._type !== 'list' || !lastBlock.children || (block.level === 1 && block.listItem !== lastBlock.listItem)) {
    blocks.push({
      _type: 'list',
      listItem: block.listItem,
      level: block.level,
      children: [block],
    })
    return blocks
  }

  // Add as child of previous list
  if (block.level === lastBlock.level && block.listItem === lastBlock.listItem) {
    lastBlock.children.push(block)
    return blocks
  }

  walkList(lastBlock.children, block)

  return blocks
}

function render (serializers: Required<Serializers>, item?: Block, children?: () => Children) {
  const serializer = findSerializer(item, serializers)
  if (!serializer) return children?.()

  if (!item) {
    return undefined
  }

  const isElement = typeof serializer === 'string'
  const props = Object.fromEntries(Object.entries(item).filter(([key]) => key !== '_type').map(
    ([key, value]) => {
      if (key === '_key') return ['key', value || null]
      if (!isElement || validAttrs.includes(key)) return [key, value]
      return []
    },
  ))

  // Forgive me, TypeScript gods...
  if (isElement) {
    return h(serializer, props, children?.())
  }

  return h(serializer, props, isVue2 ? children?.() : { default: () => children?.() })
}

function renderBlocks (blocks: Array<Block>, serializers: Required<Serializers>) {
  return blocks.map((block) => {
    const node = renderStyle(block, serializers, () => renderInSerializer(block, serializers))
    if (process.env.NODE_ENV === 'development' && (!node || (Array.isArray(node) && !node.length))) {
    // eslint-disable-next-line no-console
      console.warn(`No serializer found for block type "${block._type}".`, block)
    }
    return node
  })
}

export default defineComponent({
  name: 'SanityContent',
  props: {
    blocks: {
      type: Array as () => Array<PortableTextBlock>,
      default: () => [] as Array<PortableTextBlock>,
    },
    serializers: {
      type: Object as () => Serializers,
      default: () => ({} as Serializers),
    },
  },
  setup (props) {
    const serializers = defu(props.serializers, defaults) as Required<Serializers>
    serializers.types.list = serializers.types.list || createListSerializer(serializers)

    return () => renderBlocks(props.blocks?.reduce(walkList, [] as Array<PortableTextBlock | PortableTextListItemBlock>) || [], serializers)
  },
})

const createListSerializer = (serializers: Required<Serializers>) => {
  return defineComponent({
    name: 'ListComponent',
    inheritAttrs: false,
    props: {
      children: {
        type: Array as () => Array<PortableTextBlock | PortableTextListItemBlock>,
        default: () => [],
      },
      level: {
        type: Number,
        default: 1,
      },
    },
    setup (props) {
      return () => {
        const isOrdered = props.children[0]?.listItem === 'number'
        if (props.level > 1) {
          return h(serializers.listItem as string || 'li', [h(isOrdered ? 'ol' : 'ul', {}, isVue2
            ? renderBlocks(props.children, serializers)
            : {
                default: () => renderBlocks(props.children, serializers),
              })])
        }
        return h(isOrdered ? 'ol' : 'ul', {}, isVue2
          ? renderBlocks(props.children, serializers)
          : {
              default: () => renderBlocks(props.children, serializers),
            })
      }
    },
  })
}
