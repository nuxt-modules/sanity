import { defineEventHandler, deleteCookie, getQuery, sendRedirect } from 'h3'
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants'
import { getPreviewStateCookieOptions, previewCookieName } from '../../../constants'

export default defineEventHandler(async (event) => {
  const { redirect } = getQuery(event)
  const cookieOptions = getPreviewStateCookieOptions(import.meta.dev)
  deleteCookie(event, previewCookieName)
  deleteCookie(event, perspectiveCookieName, cookieOptions)
  await sendRedirect(event, redirect?.toString() || '/')
})
