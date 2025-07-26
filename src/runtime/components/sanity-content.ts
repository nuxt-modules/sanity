import { defineComponent, h } from 'vue'
import type {
  PortableTextBlock,
  TypedObject,
} from '@portabletext/types'
import { PortableText } from '@portabletext/vue'
import type {
  PortableTextComponents,
  MissingComponentHandler,
  ListNestMode,
} from '@portabletext/vue'

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
  },
  setup(props) {
    return () => h(PortableText, {
      value: props.value,
      components: props.components,
      onMissingComponent: props.onMissingComponent,
      listNestingMode: props.listNestingMode,
    })
  },
})
