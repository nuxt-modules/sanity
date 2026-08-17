import { variantCookieName } from '@sanity/preview-url-secret/constants'
import { computed } from 'vue'
import { useCookie } from '#imports'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'
import { getPreviewStateCookieOptions } from '../constants'
import { sanitizeVariant } from '../util/sanitizeVariant'

export const useSanityVariant = (variant?: string) => {
  const visualEditingState = useSanityVisualEditingState()

  const devMode = import.meta.dev
  // Not httpOnly, so it can be set from the client
  const cookie = useCookie<string | null>(variantCookieName, {
    default: () => null,
    ...getPreviewStateCookieOptions(devMode),
  })

  return computed<string | undefined, unknown>({
    get() {
      if (variant !== undefined) {
        return sanitizeVariant(variant)
      }
      if (visualEditingState?.enabled) {
        return sanitizeVariant(cookie.value)
      }
      return undefined
    },
    set(next) {
      cookie.value = sanitizeVariant(next) ?? null
    },
  })
}
