import type { UnfilteredResponseQueryOptions } from '@sanity/client'
import type { ContentSourceMap, QueryParams, SanityClient } from '../client'

/**
 * Proxy client for forwarding queries that require authentication to the
 * preview endpoint, i.e. when fetching draft documents when visual editing is
 * enabled.
 */
export const createProxyClient = (endpoint?: string) => {
  if (!endpoint) {
    throw new Error('No endpoint provided for proxy client')
  }

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
