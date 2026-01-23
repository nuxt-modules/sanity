import { computed, defineComponent, h } from 'vue'
import { NuxtImg } from '#components'
import { useSanity } from '../composables/useSanity'
import { buildImageUrl, sanityImageProps, urlParamKeys } from './sanity-image-props'

export default defineComponent({
  name: 'SanityImage',
  props: sanityImageProps,
  setup(props, { attrs, slots }) {
    const sanity = useSanity()

    // Compute the full image URL for slot usage
    const src = computed(() => {
      if (!props.assetId) return ''
      const projectId = props.projectId || sanity.config.projectId
      const dataset = props.dataset || sanity.config.dataset || 'production'
      return buildImageUrl(props.assetId, projectId!, dataset, props as Record<string, unknown>)
    })

    // Build NuxtImg-compatible modifiers from props
    const nuxtImgModifiers = computed(() => {
      const modifiers: Record<string, unknown> = {}
      for (const key of urlParamKeys) {
        const value = (props as Record<string, unknown>)[key]
        if (value !== undefined && value !== null) {
          modifiers[key] = value
        }
      }
      return modifiers
    })

    return () => {
      // If scoped slot is provided, use it with the computed src
      if (slots.default) {
        return slots.default({ src: src.value })
      }

      // Use NuxtImg with sanity provider
      return h(NuxtImg, {
        provider: 'sanity',
        src: props.assetId,
        modifiers: nuxtImgModifiers.value,
        // Pass width/height as top-level props for NuxtImg
        ...(props.w ? { width: props.w } : {}),
        ...(props.h ? { height: props.h } : {}),
        ...attrs,
      })
    }
  },
})
