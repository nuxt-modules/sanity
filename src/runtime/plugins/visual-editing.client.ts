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
