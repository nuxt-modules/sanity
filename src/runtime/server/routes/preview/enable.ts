import { createError, defineEventHandler, getRequestURL, setCookie, deleteCookie, sendRedirect } from 'h3'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { perspectiveCookieName, variantCookieName } from '@sanity/preview-url-secret/constants'
import defu from 'defu'
import { getPreviewStateCookieOptions, previewCookieName } from '../../../constants'
import { useSanity, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig(event)
  const sanity = useSanity()

  const sanityConfig = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)

  const client = sanity.client.withConfig({
    token: sanityConfig.visualEditing && 'token' in sanityConfig.visualEditing ? sanityConfig.visualEditing.token : undefined,
  })

  const { isValid, redirectTo = '/', studioPreviewPerspective, studioPreviewVariant } = await validatePreviewUrl(
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

  const cookieOptions = getPreviewStateCookieOptions(import.meta.dev)

  setCookie(event, previewCookieName, id, {
    httpOnly: true,
    ...cookieOptions,
  })

  if (studioPreviewPerspective) {
    setCookie(event, perspectiveCookieName, studioPreviewPerspective, cookieOptions)
  }

  if (studioPreviewVariant) {
    setCookie(event, variantCookieName, studioPreviewVariant, cookieOptions)
  }
  else {
    deleteCookie(event, variantCookieName, cookieOptions)
  }

  await sendRedirect(event, redirectTo, 307)
})
