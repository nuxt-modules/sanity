import { useSanityVisualEditingState } from '../composables'
// @ts-expect-error need correct typing of #imports
import { defineNuxtPlugin, useRuntimeConfig, useSanityVisualEditing, useSanityLiveMode, sanityVisualEditingRefresh } from '#imports'

export default defineNuxtPlugin(async () => {
  const $config = useRuntimeConfig()
  const { visualEditing } = $config.public.sanity

  const visualEditingState = useSanityVisualEditingState()

  if (!visualEditing || !visualEditingState?.enabled) return

  if (
    visualEditing.mode === 'live-visual-editing'
    || visualEditing.mode === 'visual-editing'
  ) {
    useSanityVisualEditing({
      refresh: sanityVisualEditingRefresh,
      zIndex: visualEditing.zIndex,
    })
  }

  if (visualEditing.mode === 'live-visual-editing') {
    useSanityLiveMode()
  }
})
