import { defineEventHandler, deleteCookie, getQuery, sendRedirect } from 'h3'
import { previewCookieName } from '../../../constants'

export default defineEventHandler(async (event) => {
  const { redirect } = getQuery(event)
  deleteCookie(event, previewCookieName)
  await sendRedirect(event, redirect?.toString() || '/')
})
