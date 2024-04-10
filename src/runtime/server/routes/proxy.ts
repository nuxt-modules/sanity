import { createError, defineEventHandler, readBody, getCookie } from 'h3'

import { useSanity, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig()
  const sanity = useSanity()

  const { query, params = {}, options } = await readBody(event)
  const previewModeCookie = getCookie(event, '__sanity_preview')

  const { visualEditing } = $config.sanity

  if (!visualEditing || previewModeCookie !== visualEditing.previewModeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This endpoint should only be used for fetching preview mode data',
    })
  }

  const client = sanity.client.withConfig({
    token: visualEditing.token,
    useCdn: false,
  })

  return await client.fetch(query, params, options)
})
