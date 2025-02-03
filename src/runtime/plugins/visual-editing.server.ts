import { useSanityVisualEditingState, useSanityConfig } from '../composables'
import { previewCookieName } from '../constants'
import { defineNuxtPlugin, useCookie } from '#imports'

export default defineNuxtPlugin(() => {
  const { visualEditing } = useSanityConfig()
  const visualEditingState = useSanityVisualEditingState()

  if (!visualEditingState) return

  const { previewMode, previewModeId } = visualEditingState
  // If preview mode is _configured_ (i.e. `visualEditing.previewMode` is set)
  // check the cookie value against `previewModeId` to determine if visual
  // editing is enabled.
  if (previewMode) {
    const previewModeCookie = useCookie(previewCookieName)
    visualEditingState.enabled = previewModeCookie.value === previewModeId
  // If preview mode is _not_ configured, just enable visual editing.
  }
  else if (typeof visualEditing === 'object' && !previewMode) {
    visualEditingState.enabled = true
  }
})
