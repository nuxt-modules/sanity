import { createError, defineEventHandler, getRequestURL, setCookie, sendRedirect, useRuntimeConfig } from 'nuxt/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import defu from 'defu'
import { previewCookieName } from '../../../constants'
import { useSanity } from '../../utils/index.portable'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig()
  const sanity = useSanity()

  const sanityConfig = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)

  const client = sanity.client.withConfig({
    token: sanityConfig.visualEditing && 'token' in sanityConfig.visualEditing ? sanityConfig.visualEditing.token : undefined,
  })

  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    client,
    getRequestURL(event).toString(),
  )

  if (!isValid) {
    throw createError({
      status: 401,
      statusText: 'Invalid secret',
    })
  }

  const id = sanityConfig.visualEditing && 'previewModeId' in sanityConfig.visualEditing
    ? sanityConfig.visualEditing.previewModeId
    : undefined as never

  setCookie(event, previewCookieName, id, {
    httpOnly: true,
    sameSite: !import.meta.dev ? 'none' : 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  return sendRedirect(event, redirectTo, 307)
})
