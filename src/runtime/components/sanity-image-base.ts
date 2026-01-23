import { computed, defineComponent, h } from 'vue'
import { useSanity } from '../composables'
import { baseURL, sanityImageProps, urlParamKeys } from './sanity-image-props'

export default defineComponent({
  name: 'SanityImage',
  props: sanityImageProps,
  setup(props, { attrs, slots }) {
    const sanity = useSanity()

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

    return () => {
      // Use scoped slot if provided, otherwise render img
      return slots.default?.({ src: src.value }) || h('img', {
        ...attrs,
        src: src.value,
      })
    }
  },
})
