import { createError, defineEventHandler, getRequestURL, setCookie, sendRedirect } from 'h3'
import { validatePreviewUrl } from '@sanity/preview-url-secret'

import { useSanity, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig()
  const sanity = useSanity()

  const client = sanity.client.withConfig({
    token: $config.sanity.visualEditing!.token,
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

  setCookie(event, '__sanity_preview', $config.sanity.visualEditing!.previewModeId, {
    httpOnly: true,
    sameSite: !import.meta.dev ? 'none' : 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  await sendRedirect(event, redirectTo, 307)
})
