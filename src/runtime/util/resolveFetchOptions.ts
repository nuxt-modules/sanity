import type { ClientPerspective, InitializedClientConfig, QueryOptions, StegaConfig, UnfilteredResponseQueryOptions } from '../client'
import type { SanityResolvedConfig } from '../types'

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

export function resolveFetchOptions({
  clientConfig,
  lastLiveEventId,
  liveContentEnabled,
  perspective,
  queryOptions,
  runtimeConfig,
  stega,
  visualEditingEnabled,
}: {
  clientConfig?: InitializedClientConfig
  lastLiveEventId?: string
  liveContentEnabled?: boolean
  perspective?: ClientPerspective
  queryOptions?: QueryOptions
  runtimeConfig?: SanityResolvedConfig
  stega?: StegaConfig | boolean
  visualEditingEnabled?: boolean
}): UnfilteredResponseQueryOptions {
  // Stega encoding is only enabled when configured on the client and visual
  // editing is enabled, unless explicitly set in the query options.
  const stegaFromClientConfig = (
    clientConfig?.stega?.enabled
    && typeof clientConfig?.stega.studioUrl !== 'undefined'
    && visualEditingEnabled
  ) || undefined
  const resolvedStega = stega ?? stegaFromClientConfig

  // These tokens grant access to draft content, so they are only included
  // when fetching content for an explicit draft perspective. For 'published'
  // and 'raw' (the default), the client's own token (if any) is sufficient.
  // The visual editing token additionally requires visual editing to be
  // enabled, since it is specifically intended for that context.
  const needsDraftToken = perspective !== 'published' && perspective !== 'raw'
  const tokenFromRuntimeConfig = needsDraftToken
    ? (runtimeConfig?.liveContent?.serverToken
      ?? (visualEditingEnabled ? runtimeConfig?.visualEditing?.token : undefined))
    : undefined
  const resolvedToken = queryOptions?.token ?? tokenFromRuntimeConfig

  // When using the Live Content API, we use the CDN for published content and
  // bypass it for drafts. Without LCAPI, we leave useCdn unset so the client's
  // own configuration applies.
  const resolvedUseCdn = queryOptions?.useCdn
    ?? (liveContentEnabled ? perspective === 'published' : undefined)

  // Use 'noStale' when Live Content API is enabled and fetching published
  // content using the CDN.
  const resolvedCacheMode = queryOptions?.cacheMode
    ?? (liveContentEnabled && resolvedUseCdn ? 'noStale' as const : undefined)

  // Only enable source maps when visual editing is enabled, unless explicitly
  // set in the query options.
  const resolvedResultSourceMap = queryOptions?.resultSourceMap
    ?? (visualEditingEnabled ? 'withKeyArraySelector' : undefined)

  return {
    // Pass through user-provided query options unmodified.
    ...queryOptions,
    // Our resolved values override queryOptions only when defined. Undefined
    // values are stripped so they don't shadow queryOptions or override
    // client-level defaults.
    ...stripUndefined({
      filterResponse: false as const,
      returnQuery: true as const,
      resultSourceMap: resolvedResultSourceMap,
      cacheMode: resolvedCacheMode,
      lastLiveEventId,
      perspective,
      stega: resolvedStega,
      token: resolvedToken,
      useCdn: resolvedUseCdn,
    }),
  }
}
