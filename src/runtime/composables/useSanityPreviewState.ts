import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { ClientPerspective } from '@sanity/client'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'
import { useSanityPerspective } from './useSanityPerspective'
import { useSanityConfig } from './useSanityConfig'

/**
 * Public return type of `useSanityPreviewState`
 * @public
 */
export interface SanityPreviewState {
  /**
   * Whether preview / visual editing is currently active.
   * Always returns a plain boolean — never `undefined`.
   */
  isPreview: ComputedRef<boolean>
  /**
   * The current Sanity query perspective, e.g. `'published'` or
   * `'previewDrafts'`. Updates reactively when Presentation Tool changes the
   * perspective cookie.
   */
  perspective: ComputedRef<ClientPerspective>
  /**
   * Whether stega encoding is currently enabled (preview active AND stega
   * configured in the module options).
   */
  stegaEnabled: ComputedRef<boolean>
}

/**
 * Exposes the current Sanity preview / visual editing state as reactive
 * computed refs.
 *
 * Useful for advanced users who want to build their own conditional fetch
 * logic or adapt the UI based on whether the app is being viewed inside
 * Sanity Presentation Tool, without needing to reach into internal module
 * state directly.
 *
 * All values degrade gracefully when visual editing is not configured:
 * `isPreview` and `stegaEnabled` are `false`, `perspective` is `'published'`.
 *
 * @example
 * ```ts
 * const { isPreview, perspective, stegaEnabled } = useSanityPreviewState()
 *
 * // Conditionally show an "Edit in Studio" badge
 * // <EditBadge v-if="isPreview" />
 * ```
 *
 * @public
 */
export function useSanityPreviewState(): SanityPreviewState {
  const visualEditingState = useSanityVisualEditingState()
  const config = useSanityConfig()
  const perspective = useSanityPerspective()

  const isPreview = computed<boolean>(() => visualEditingState?.enabled ?? false)

  const stegaEnabled = computed<boolean>(() => !!(
    config.stega?.enabled
    && typeof config.stega?.studioUrl !== 'undefined'
    && (visualEditingState?.enabled ?? false)
  ))

  return {
    isPreview,
    perspective,
    stegaEnabled,
  }
}
