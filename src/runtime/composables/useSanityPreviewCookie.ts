import { previewCookieName } from '../constants'
import { useSanityConfig } from './useSanityConfig'
import { useCookie } from '#imports'

/**
 * Returns the preview mode cookie. The cookie is `httpOnly`, so its value can
 * only be read on the server — for example in server routes or during
 * server-side rendering, such as in route middleware — which can be useful to
 * protect routes when preview mode is not active.
 * @public
 */
export const useSanityPreviewCookie = () => {
  const { visualEditing } = useSanityConfig()
  return useCookie(visualEditing?.previewCookieName ?? previewCookieName)
}
