import { createError, defineEventHandler, readBody, getCookie, useRuntimeConfig } from 'nuxt/server'
import type { SanityClient } from '../../../client'
import { previewCookieName } from '../../../constants'
import { useSanity } from '../../utils/index.portable'

type FetchParams = Parameters<SanityClient['fetch']>

// Used to fetch preview data
export default defineEventHandler(async (event) => {
  const $config = useRuntimeConfig()
  const { liveContent, visualEditing } = $config.sanity

  const { query, params = {}, options } = await readBody<{ query: FetchParams[0], params?: FetchParams[1], options: FetchParams[2] }>(event)
  const previewModeCookie = getCookie(event, previewCookieName)

  const token = visualEditing?.token || liveContent?.serverToken

  if (!visualEditing || !token) {
    throw createError({
      status: 500,
      statusText: 'Unable to fetch preview data. The application is incorrectly configured for previews.',
    })
  }

  if (previewModeCookie !== visualEditing.previewModeId) {
    throw createError({
      status: 403,
      statusText: 'Invalid preview cookie.',
    })
  }

  const sanity = useSanity()

  const client = sanity.client.withConfig({
    token,
    useCdn: false,
  })

  return await client.fetch(query, params, options)
})
