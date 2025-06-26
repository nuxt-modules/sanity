import { createError, defineEventHandler, readBody, getCookie } from 'h3'
import defu from 'defu'

import { useSanity, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig(event)
  const sanity = useSanity()

  const { query, params = {}, options } = await readBody(event)
  const previewModeCookie = getCookie(event, '__sanity_preview')

  const { visualEditing } = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)

  if (!visualEditing || !('previewModeId' in visualEditing) || previewModeCookie !== visualEditing.previewModeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This endpoint should only be used for fetching preview mode data',
    })
  }

  const client = sanity.client.withConfig({
    token: visualEditing && 'token' in visualEditing ? visualEditing.token : undefined,
    useCdn: false,
  })

  return await client.fetch(query, params, options)
})
