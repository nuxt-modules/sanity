import type { createClient } from '#sanity-client'

export type SanityClient = ReturnType<typeof createClient>
export { createClient } from '#sanity-client'
export type {
  ClientPerspective,
  ClientConfig,
  ContentSourceMap,
  InitializedClientConfig,
  QueryParams,
  QueryOptions,
  StegaConfig,
  UnfilteredResponseQueryOptions,
} from '#sanity-client'
