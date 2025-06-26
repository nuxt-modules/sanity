import defu from 'defu'
import { useSanityVisualEditingState } from '../composables/visual-editing'
import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#imports'

export default defineNuxtPlugin(() => {
  const visualEditingState = useSanityVisualEditingState()

  const $config = useRuntimeConfig()
  const { visualEditing } = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)

  // If preview mode is _configured_ (i.e. `visualEditing.previewMode` is set)
  // check the cookie value against `previewModeId` to determine if visual
  // editing is enabled.
  if (visualEditing?.previewMode) {
    const previewModeCookie = useCookie('__sanity_preview')
    visualEditingState.enabled = 'previewModeId' in visualEditing && previewModeCookie.value === visualEditing.previewModeId
  // If preview mode is _not_ configured, just enable visual editing.
  }
  else if (visualEditing && typeof visualEditing === 'object' && (!('previewMode' in visualEditing) || !visualEditing.previewMode)) {
    visualEditingState.enabled = true
  }
})
