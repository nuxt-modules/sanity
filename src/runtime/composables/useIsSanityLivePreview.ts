import { computed, type Ref } from 'vue'
import { useSanityPreviewEnvironment } from './useSanityPreviewEnvironment'

/**
 * Detects if the application is considered to be in a "Live Preview" mode. Live
 * Preview means that the application is either being viewed inside Sanity
 * Presentation Tool or being previewed in a standalone context. Useful for
 * conditionally rendering UI that should only be visible to content editors.
 * The composable returns `null` initially, to signal it doesn't yet know if
 * it's live previewing or not. Then `true` if it is, and `false` otherwise.
 * @public
 */
export function useIsSanityLivePreview(): Ref<boolean | null> {
  const env = useSanityPreviewEnvironment()
  return computed(() => {
    if (env.value === 'checking') return null
    return ['presentation-iframe', 'presentation-window', 'live'].includes(env.value)
  })
}
