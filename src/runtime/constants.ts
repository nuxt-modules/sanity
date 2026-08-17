export const previewCookieName = 'sanity-preview-id'

/**
 * Cookie flags for preview perspective and variant state. Not httpOnly, so the
 * client can update them when Presentation changes.
 */
export function getPreviewStateCookieOptions(dev: boolean) {
  return {
    path: '/',
    sameSite: (dev ? 'lax' : 'none') as 'lax' | 'none',
    secure: !dev,
  }
}
