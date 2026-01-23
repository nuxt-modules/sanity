import { computed, defineComponent, h } from 'vue'
import type {
  PortableTextBlock,
  TypedObject,
} from '@portabletext/types'
import { PortableText } from '@portabletext/vue'
import type { ListNestMode, MissingComponentHandler, PortableTextComponents } from '@portabletext/vue'
import SanityImage from '#build/sanity-image.mjs'

// Type for Sanity image data structure in portable text
interface SanityImageValue {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
  // TODO: Not in use
  caption?: string
  // TODO: Not in use
  attribution?: string
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

// Default image component that handles Sanity images automatically
const createDefaultImageComponent = () => (portableTextProps: { value: SanityImageValue }) => {
  const { value } = portableTextProps

  // Handle the correct Sanity image structure
  const assetId = value.asset?._ref

  if (!assetId) {
    console.warn('SanityContent: Image missing asset reference', value)
    return h('div', { class: 'sanity-image-error' }, 'Image not found')
  }

  // Prepare props for the SanityImage component
  const sanityImageProps: Record<string, unknown> = {
    assetId,
  }

  return h(SanityImage, sanityImageProps)
}

export default defineComponent({
  name: 'SanityContent',
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, Object] as unknown as () => TypedObject | TypedObject[],
      default: () => [] as Array<PortableTextBlock>,
    },
    components: {
      type: Object as () => PortableTextComponents,
      default: () => ({} as PortableTextComponents),
    },
    onMissingComponent: {
      type: [Function, Boolean] as unknown as () => MissingComponentHandler | false,
      default: undefined,
    },
    listNestingMode: {
      type: String as () => ListNestMode,
      default: undefined,
    },
    disableDefaultImageComponent: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // Merge user components with defaults, allowing user components to override defaults
    // Use computed to make it reactive to prop changes
    const mergedComponents = computed(() => ({
      types: {
        ...(props.disableDefaultImageComponent
          ? {}
          : {
              image: createDefaultImageComponent(),
            }),
        ...props.components.types,
      },
      ...props.components,
    }))

    return () => h(PortableText, {
      value: props.value,
      components: mergedComponents.value,
      onMissingComponent: props.onMissingComponent,
      listNestingMode: props.listNestingMode,
    })
  },
})
