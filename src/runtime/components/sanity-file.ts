import { computed, defineComponent, h } from 'vue'
import { useSanity } from '#imports'

const baseURL = 'https://cdn.sanity.io/files'

export default defineComponent({
  name: 'SanityImage',
  props: {
    assetId: { type: String, required: true },
    projectId: {
      type: String,
      default: null,
    },
    dataset: {
      type: String,
      default: null,
    },
    download: {
      type: [String, Boolean],
      default: false,
    },
  },
  setup(props, { slots }) {
    const sanity = useSanity()
    const src = computed(() => {
      const parts = props.assetId.split('-').slice(1)
      const format = parts.pop()

      const projectId = props.projectId || sanity.config.projectId
      const dataset = props.dataset || sanity.config.dataset || 'production'

      const filename = `${parts.join('-')}.${format}`
      const src = [baseURL, projectId, dataset, filename].join('/')

      if (props.download) {
        return src + '?dl=' + (typeof props.download === 'string' ? props.download : '')
      }
      return src
    })

    return () => slots.default?.({ src: src.value }) || h('span')
  },
})
