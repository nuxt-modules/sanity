import { computed, defineComponent, h } from 'vue'
import { NuxtImg } from '#components'
import { useSanity } from '../composables/useSanity'
import { baseURL, sanityImageProps, urlParamKeys } from './sanity-image-props'

export default defineComponent({
  name: 'SanityImage',
  props: sanityImageProps,
  setup(props, { attrs, slots }) {
    const sanity = useSanity()

    // Compute the full image URL for fallback/slot usage
    const src = computed(() => {
      const queryParams = urlParamKeys
        .map((prop) => {
          const urlFormat = prop.replace(/[A-Z]/, r => '-' + r.toLowerCase())
          const value = (props as Record<string, unknown>)[prop]
          return value ? `${urlFormat}=${value}` : undefined
        })
        .filter(Boolean)
        .join('&')

      const parts = props.assetId?.split('-').slice(1) || []
      const format = parts.pop()

      const projectId = props.projectId || sanity.config.projectId
      const dataset = props.dataset || sanity.config.dataset || 'production'

      const filename = `${parts.join('-')}.${format}${queryParams ? '?' + queryParams : ''}`
      return [baseURL, projectId, dataset, filename].join('/')
    })

    // Build NuxtImg-compatible options from props
    const nuxtImgModifiers = computed(() => {
      const modifiers: Record<string, unknown> = {}

      // Map Sanity image props to NuxtImg modifiers
      // These are passed through to the Sanity provider
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
