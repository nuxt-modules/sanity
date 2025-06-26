import { createError, defineEventHandler, getRequestURL, setCookie, sendRedirect } from 'h3'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import defu from 'defu'

import { useSanity, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig(event)
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
      statusCode: 401,
      statusMessage: 'Invalid secret',
    })
  }

  const id = sanityConfig.visualEditing && 'previewModeId' in sanityConfig.visualEditing
    ? sanityConfig.visualEditing.previewModeId
    : undefined as never

  setCookie(event, '__sanity_preview', id, {
    httpOnly: true,
    sameSite: !import.meta.dev ? 'none' : 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  await sendRedirect(event, redirectTo, 307)
})
