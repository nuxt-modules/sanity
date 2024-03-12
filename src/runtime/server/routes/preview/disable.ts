import { defineEventHandler, deleteCookie, getQuery, sendRedirect } from 'h3'

export default defineEventHandler(async event => {
  const { redirect } = getQuery(event)
  deleteCookie(event, '__sanity_preview')
  await sendRedirect(event, redirect?.toString() || '/')
})
