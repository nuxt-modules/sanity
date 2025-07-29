import { defineNuxtPlugin, sanityVisualEditingRefresh } from '#imports'
import { useSanityConfig, useSanityVisualEditingState, useSanityVisualEditing, useSanityLiveMode } from '../composables'

export default defineNuxtPlugin(async () => {
  const { visualEditing } = useSanityConfig()

  const visualEditingState = useSanityVisualEditingState()

  if (!visualEditing || !visualEditingState?.enabled) return

  if (
    visualEditing.mode === 'live-visual-editing'
    || visualEditing.mode === 'visual-editing'
  ) {
    useSanityVisualEditing({
      refresh: sanityVisualEditingRefresh,
      zIndex: visualEditing.zIndex || undefined,
    })
  }

  if (visualEditing.mode === 'live-visual-editing') {
    useSanityLiveMode()
  }
})
