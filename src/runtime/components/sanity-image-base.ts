import { computed, defineComponent, h } from 'vue'
import { useSanity } from '../composables/useSanity'
import { buildImageUrl, sanityImageProps } from './sanity-image-props'

export default defineComponent({
  name: 'SanityImage',
  props: sanityImageProps,
  setup(props, { attrs, slots }) {
    const sanity = useSanity()

    const src = computed(() => {
      if (!props.assetId) return ''
      const projectId = props.projectId || sanity.config.projectId
      const dataset = props.dataset || sanity.config.dataset || 'production'
      return buildImageUrl(props.assetId, projectId!, dataset, props as Record<string, unknown>)
    })

    return () => {
      // Use scoped slot if provided, otherwise render img
      return slots.default?.({ src: src.value }) || h('img', {
        ...attrs,
        src: src.value,
      })
    }
  },
})
