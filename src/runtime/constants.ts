export const previewCookieName = 'sanity-preview-id'

/**
 * Cookie flags for preview perspective state. Not httpOnly, so the client can
 * update them when Presentation changes the perspective.
 */
export function getPreviewStateCookieOptions(dev: boolean) {
  return {
    path: '/',
    sameSite: (dev ? 'lax' : 'none') as 'lax' | 'none',
    secure: !dev,
  }
}
