import { defineNuxtPlugin } from '#imports'
import { sanityVisualEditingRefresh } from '#build/sanity-visual-editing-refresh.mjs'
import { useSanityConfig } from '../composables/useSanityConfig'
import { useSanityVisualEditingState } from '../composables/useSanityVisualEditingState'
import { useSanityVisualEditing } from '../composables/useSanityVisualEditing'
import { useSanityLiveMode } from '../composables/useSanityLiveMode'

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
