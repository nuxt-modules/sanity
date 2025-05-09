import { useSanityConfig } from './useSanityConfig'

export const useSanityVisualEditingState = () => {
  const { visualEditing } = useSanityConfig()

  if (!visualEditing) {
    return undefined
  }

  const previewState = useState('sanity-preview', () => false)

  const enabled = computed({
    get() {
      // If preview mode is set to false, then visual editing is "always on"
      if (visualEditing.previewMode === false) return true
      // Otherwise return the previewState value
      return previewState.value
    },
    set(enabled: boolean) {
      previewState.value = enabled
    },
  })

  const isInFrame = () => {
    // Return undefined if on server
    if (import.meta.server) return undefined
    return !!(window.self !== window.top || window.opener)
  }

  return reactive({
    enabled,
    /**
     * @deprecated Use the `useIsSanityLivePreview` and
     * `useIsSanityPresentationTool` composables for conditional rendering
     * instead
     */
    inFrame: isInFrame(),
    token: visualEditing.token,
    previewMode: visualEditing.previewMode,
    previewModeId: visualEditing.previewModeId,
  })
}
