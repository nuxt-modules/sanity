import type { ClientConfig, QueryParams } from '../../client'
import type { SanityHelper } from '../../../types'

/**
 * Internal composable to handle re-execution of queries based on incoming tags
 * @internal
 */
export const useSanityTagRevalidation = ({
  queryKey,
  sanity,
}: {
  queryKey: string
  sanity: SanityHelper
}) => {
  const liveContentTags = useState<string[]>(`tags:${queryKey}`, () => [])

  let unsubscribe = () => {}

  if (import.meta.client && sanity.tagStore) {
    unsubscribe = sanity.tagStore.subscribe((tags) => {
      // If any of the incoming tags match any of the tags associated with this
      // query, call `refreshNuxtData` to invalidate the cache and re-execute
      // the `useAsyncData` call defined above
      const tagsSet = new Set(tags)
      if (liveContentTags.value.some(tag => tagsSet.has(tag))) {
        refreshNuxtData(queryKey)
      }
    })
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
    const { syncTags } = await sanity.fetch(query, params, {
      ...options,
      returnQuery: false,
      stega: false,
      tag: ['fetch-sync-tags'].filter(Boolean).join('.'),
    })

    liveContentTags.value = syncTags?.map(tag => `sanity:${tag}`) || []
  }

  return { fetchTags, unsubscribe }
}
