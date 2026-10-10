import { defineEventHandler, deleteCookie, getQuery, sendRedirect } from 'nuxt/server'
import { previewCookieName } from '../../../constants'

export default defineEventHandler((event) => {
  const { redirect } = getQuery(event)
  deleteCookie(event, previewCookieName)
  return sendRedirect(event, redirect?.toString() || '/')
})
