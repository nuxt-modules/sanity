// @ts-expect-error need correct typing of #imports
import { defineNuxtPlugin, useRuntimeConfig, useSanityVisualEditing, useSanityVisualEditingState, useSanityLiveMode } from '#imports'

export default defineNuxtPlugin(() => {
  // The state value will be true if preview mode is enabled.
  // If preview mode is not enabled, return early.
  if (!useSanityVisualEditingState().value) return

  const $config = useRuntimeConfig()
  const { visualEditing } = $config.public.sanity

  if (
    visualEditing?.mode === 'live-visual-editing' ||
    visualEditing?.mode === 'visual-editing'
  ) {
    useSanityVisualEditing({
      refresh: visualEditing?.refresh,
      zIndex: visualEditing?.zIndex,
    })
  }

  if (visualEditing?.mode === 'live-visual-editing') {
    useSanityLiveMode()
  }
})
