import { refreshNuxtData, useState } from '#imports'
import type { ClientConfig, QueryParams, SanityClient } from '../../client'
import type { SanityLiveStore } from '../../types'

/**
 * Internal composable to handle re-execution of queries based on incoming tags
 * @internal
 */
export const useSanityTagRevalidation = ({
  client,
  queryKey,
  liveStore,
}: {
  client: SanityClient
  queryKey: string
  liveStore: SanityLiveStore | undefined
}) => {
  const liveContentTags = useState<string[]>(`tags:${queryKey}`, () => [])

  let unsubscribe = () => { }
  let getLastLiveEventId: () => string | undefined = () => undefined

  if (import.meta.client && liveStore) {
    const subscriber = liveStore.subscribe(queryKey, (tags, updateLastLiveEventId) => {
      // If any of the incoming tags match any of the tags associated with this
      // query, call `refreshNuxtData` to invalidate the cache and re-execute
      // the `useAsyncData` call defined above
      const tagsSet = new Set(tags)
      if (liveContentTags.value.some(tag => tagsSet.has(tag))) {
        updateLastLiveEventId()
        refreshNuxtData(queryKey)
      }
    })
    unsubscribe = subscriber.unsubscribe
    getLastLiveEventId = subscriber.getLastLiveEventId
  }

  const fetchTags = async (
    query: string,
    params: QueryParams | undefined,
    options: {
      cacheMode: 'noStale' | undefined
      filterResponse: false
      perspective: ClientConfig['perspective']
      useCdn: boolean
    }) => {
    const { syncTags } = await client.fetch(query, params, {
      ...options,
      resultSourceMap: false,
      returnQuery: false,
      stega: false,
      tag: ['fetch-sync-tags'].filter(Boolean).join('.'),
    })

    liveContentTags.value = syncTags?.map(tag => `sanity:${tag}`) || []
  }

  return { fetchTags, getLastLiveEventId, unsubscribe }
}
