import type { PreviewEnvironment } from '../types'

/**
 * Reports the current preview mode environment.
 * Use it to determine how to adapt the UI based on whether:
 * - Your app is previewed in a iframe, inside Presentation Tool in a Sanity Studio.
 * - Your app is previewed in a new window, spawned from Presentation Tool in a Sanity Studio.
 * - Your app is live previewing drafts in a standalone context.
 * - Your app is previewing drafts, but not live.
 * - Your app is not previewing anything (that could be detected).
 * @public
 */
export function useSanityPreviewEnvironment() {
  return useState<PreviewEnvironment>('sanity-preview-environment', () => 'checking')
}
