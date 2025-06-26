import { createError, defineEventHandler, readBody, getCookie } from 'h3'
import { previewCookieName } from '../../../constants'
import { useSanity, useRuntimeConfig } from '#imports'

// Used to fetch preview data
export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig(event)
  const { liveContent, visualEditing } = $config.sanity

  const { query, params = {}, options } = await readBody(event)
  const previewModeCookie = getCookie(event, previewCookieName)

  const token = visualEditing?.token || liveContent?.serverToken

  if (!visualEditing || !token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to fetch preview data. The application is incorrectly configured for previews.',
    })
  }

  if (previewModeCookie !== visualEditing.previewModeId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid preview cookie.',
    })
  }

  const sanity = useSanity()

  const client = sanity.client.withConfig({
    token,
    useCdn: false,
  })

  return await client.fetch(query, params, options)
})
