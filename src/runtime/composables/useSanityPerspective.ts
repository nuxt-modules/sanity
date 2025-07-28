import { validateApiPerspective, type ClientPerspective } from '@sanity/client'
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'
import { computed } from 'vue'
import { useCookie } from '#imports'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'

const sanitizePerspective = (
  _perspective: unknown,
  fallback: 'previewDrafts' | 'published',
): Exclude<ClientPerspective, 'raw'> => {
  const perspective
    = typeof _perspective === 'string' && _perspective.includes(',')
      ? _perspective.split(',')
      : _perspective
  try {
    validateApiPerspective(perspective)
    return perspective === 'raw' ? fallback : perspective
  }
  catch (err) {
    console.warn(`Invalid perspective:`, _perspective, perspective, err)
    return fallback
  }
}

export const useSanityPerspective = (perspective?: ClientPerspective) => {
  const visualEditingState = useSanityVisualEditingState()

  const devMode = import.meta.dev
  // Not httpOnly, so it can be set from the client
  const cookie = useCookie<ClientPerspective | null>(perspectiveCookieName, {
    default: () => null,
    sameSite: devMode ? 'lax' : 'none',
    secure: !devMode,
    path: '/',
  })

  return computed<ClientPerspective, unknown>({
    get() {
      // Give preference to any explicitly provided perspective
      if (perspective) {
        return perspective
      }
      // If visual editing isn't configured or if it is configured AND enabled use
      // the sanitized value of the cookie, defaulting to 'previewDrafts' if it is
      // not yet set
      if (visualEditingState?.enabled) {
        return sanitizePerspective(cookie.value, 'previewDrafts')
      }
      return 'published'
    },
    set(perspective) {
      try {
        validateApiPerspective(perspective)
        cookie.value = perspective
      }
      catch {
        cookie.value = null
      }
    },
  })
}
