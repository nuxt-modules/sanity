import type { UnfilteredResponseQueryOptions } from '@sanity/client'
import type { ContentSourceMap, QueryParams, SanityClient } from '../client'

/**
 * Creates a minimal client that forwards all queries to a given endpoint.
 * Useful for routing requests through a server-side handler (e.g. with
 * authentication when fetching draft documents for visual editing).
 */
export const createForwardingClient = (endpoint: string) => {
  return {
    fetch: <T>(
      query: string,
      params: QueryParams,
      options: UnfilteredResponseQueryOptions,
    ) => {
      return $fetch<{ result: T, resultSourceMap: ContentSourceMap }>(
        endpoint,
        {
          method: 'POST',
          body: { query, params, options },
        },
      )
    },
  } as SanityClient
}
