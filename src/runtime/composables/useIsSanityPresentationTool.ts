import { useSanityPreviewEnvironment } from './useSanityPreviewEnvironment'

/**
 * Detects if the application is being previewed inside Sanity Presentation
 * Tool. Presentation Tool can open the application in an iframe, or in a new
 * window. Useful in contexts where you want to conditionally render a preview
 * mode toggle. The composable returns `null` initially, when it's not yet sure
 * if the application is running inside Presentation Tool, then `true` if it is,
 * and `false` otherwise.
 * @public
 */
export function useIsSanityPresentationTool() {
  return computed(() => {
    const env = useSanityPreviewEnvironment().value
    if (env === 'checking') return null
    return (['presentation-iframe', 'presentation-window'].includes(env))
  })
}
