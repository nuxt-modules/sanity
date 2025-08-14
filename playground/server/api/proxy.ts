import { defineEventHandler, readBody } from 'h3'
import type { SanityClient } from '@sanity/client'
import { useSanity } from '#imports'

type FetchParams = Parameters<InstanceType<typeof SanityClient>['fetch']>

interface RequestBody {
  query: FetchParams[0]
  params: FetchParams[1]
  options: FetchParams[2]
}

export default defineEventHandler(async (event) => {
  const { query, params = {}, options } = await readBody<RequestBody>(event)

  await validateSanityQuery(query, {
    debug: true,
    filter: {
      include: ['pages/**', 'components/**'],
    },
  })

  const sanity = useSanity()
  const token = process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN
  const client = sanity.client.withConfig({ token })
  return client.fetch(query, params, options)
})
