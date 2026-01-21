import type { UnfilteredResponseQueryOptions } from '@sanity/client'
import type { ContentSourceMap, QueryParams, SanityClient } from '../client'
import { useSanityConfig } from '../composables/useSanityConfig'

/**
 * Proxy client for forwarding queries that require authentication to the
 * preview endpoint, i.e. when fetching draft documents when visual editing is
 * enabled.
 */
export const createProxyClient = () => {
  const config = useSanityConfig()

  return {
    fetch: <T> (
      query: string,
      params: QueryParams,
      options: UnfilteredResponseQueryOptions,
    ) => {
      if (!config.visualEditing) {
        throw new Error('Visual editing is not configured')
      }

      return $fetch<{ result: T, resultSourceMap: ContentSourceMap }>(
        config.visualEditing?.proxyEndpoint,
        {
          method: 'POST',
          body: { query, params, options },
        })
    },
  } as SanityClient
}
