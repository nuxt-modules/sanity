import type { ClientPerspective } from '@sanity/client'
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'
import { computed } from 'vue'
import { useCookie } from '#imports'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'

function isValidPerspective(perspective: unknown, allowRaw: false): perspective is Exclude<ClientPerspective, 'raw'>
function isValidPerspective(perspective: unknown, allowRaw: true): perspective is ClientPerspective
function isValidPerspective(perspective: unknown, allowRaw: boolean) {
  if (typeof perspective == 'string') {
    return (
      perspective === 'published'
      || perspective === 'drafts'
      || perspective === 'previewDrafts'
      || (allowRaw && perspective === 'raw')
    )
  }
  if (Array.isArray(perspective)) {
    return perspective.every(p => typeof p === 'string')
  }
  return false
}

const sanitizePerspective = (
  _perspective: unknown,
  fallback: 'drafts' | 'published',
): Exclude<ClientPerspective, 'raw'> => {
  // If we have a comma separated string, split it into an array
  const perspective
    = typeof _perspective === 'string' && _perspective.includes(',')
      ? _perspective.split(',')
      : _perspective
  try {
    if (isValidPerspective(perspective, false)) {
      return perspective
    }
    return fallback
  }
  catch (err) {
    console.warn(`Invalid perspective:`, _perspective, perspective, err)
    return fallback
  }
}

export const useSanityPerspective = (perspective?: ClientPerspective, fallback?: ClientPerspective) => {
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
      // the sanitized value of the cookie, defaulting to 'drafts' if it is
      // not yet set
      if (visualEditingState?.enabled) {
        return sanitizePerspective(cookie.value, 'drafts')
      }
      return fallback || 'published'
    },
    set(perspective) {
      try {
        if (isValidPerspective(perspective, true)) {
          cookie.value = perspective
        }
        else {
          throw new Error('Invalid perspective value provided')
        }
      }
      catch {
        cookie.value = null
      }
    },
  })
}
