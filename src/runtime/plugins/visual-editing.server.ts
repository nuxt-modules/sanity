import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#imports'
import { useSanityVisualEditingState } from '../composables/_internal'

export default defineNuxtPlugin(() => {
  const enabled = useSanityVisualEditingState()

  const $config = useRuntimeConfig()
  const { visualEditing } = $config.sanity

  // If preview mode is _configured_ (i.e. `visualEditing.previewMode` is set)
  // check the cookie value against `previewModeId` to determine if visual
  // editing is enabled.
  if (visualEditing?.previewMode) {
    const previewModeCookie = useCookie('__sanity_preview')
    enabled.value = previewModeCookie.value === visualEditing.previewModeId
  // If preview mode is _not_ configured, just enable visual editing.
  } else if (typeof visualEditing === 'object' && !visualEditing.previewMode) {
    enabled.value = true
  }
})
