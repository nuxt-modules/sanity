import { computed } from 'vue'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'
import { useSanityVariant } from './useSanityVariant'

/**
 * Used for detecting the editing variant in visual editing, will return
 * `undefined` if visual editing is not enabled or no variant is selected.
 * @public
 */
export const useSanityPreviewVariant = () => {
  const visualEditingState = useSanityVisualEditingState()

  const variant = useSanityVariant()

  return computed<string | undefined>({
    get() {
      if (visualEditingState?.enabled) {
        return variant.value
      }
      return undefined
    },
    set(next) {
      variant.value = next
    },
  })
}
