import { defineEventHandler, deleteCookie, sendRedirect } from 'h3'

export default defineEventHandler(async event => {
  deleteCookie(event, '__sanity_draft')
  sendRedirect(event, '/')
})
