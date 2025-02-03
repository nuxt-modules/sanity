import type { ClientPerspective } from '@sanity/client'

export type PreviewPerspective = 'checking' | 'unknown' | ClientPerspective

/**
 * Used for detecting the perspective in both visual editing and live modes,
 * will return null if visual editing is not enabled.
 * @public
 */
export const useSanityPreviewPerspective = () => {
  const visualEditingState = useSanityVisualEditingState()

  const perspective = useSanityPerspective()

  return computed<PreviewPerspective>({
    get() {
      // If visual editing isn't configured or if it is configured AND enabled use
      // the sanitized value of the cookie, defaulting to 'previewDrafts' if it is
      // not yet set
      if (visualEditingState?.enabled) {
        return perspective.value
      }
      // The default perspective is 'published'
      return 'unknown'
    },
    set(newPerspective) {
      perspective.value = newPerspective
    },
  })
}
