import { extendVue } from './vue'

// eslint-disable-next-line
import type { SanityConfiguration } from '..'

const baseURL = 'https://cdn.sanity.io/files'

export const SanityFile = extendVue({
  name: 'SanityImage',
  functional: true,
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
  render (h, { props, parent, scopedSlots }) {
    const parts = props.assetId.split('-').slice(1)
    const format = parts.pop()

    const projectId = props.projectId || (parent && parent.$sanity.config.projectId)
    const dataset = props.dataset || (parent.$sanity && parent.$sanity.config.dataset) || 'production'

    let src = `${baseURL}/${projectId}/${dataset}/${parts.join(
      '-',
    )}.${format}`

    if (props.download) {
      src = src + '?dl=' + (typeof props.download === 'string' ? props.download : '')
    }

    return scopedSlots.default({ src }) || h('span')
  },
})

export default SanityFile
