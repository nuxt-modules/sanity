import { defineEventHandler, deleteCookie, getQuery, sendRedirect } from 'h3'
import { previewCookieName } from '../../../constants'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const { redirect } = getQuery(event)
  const $config = useRuntimeConfig(event)
  deleteCookie(event, $config.public.sanity.visualEditing?.previewCookieName ?? previewCookieName)
  await sendRedirect(event, redirect?.toString() || '/')
})
