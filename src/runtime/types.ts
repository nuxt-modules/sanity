import type { Ref } from 'vue'
import type { HistoryRefresh, VisualEditingOptions } from '@sanity/visual-editing'
import type { QueryStore } from '@sanity/core-loader'
import type { AsyncDataOptions } from 'nuxt/app'
import type { ClientPerspective, ContentSourceMap, StegaConfig } from '@sanity/client'
import type { EncodeDataAttributeFunction } from '@sanity/core-loader/encode-data-attribute'
import type { ClientConfig, QueryOptions, SanityClient } from './client'

/**
 * Augmented version of Nuxt's _AsyncData, with additional properties like
 * `encodeDataAttribute`
 * @internal
 */
interface _AsyncSanityData<DataT, ErrorT> {
  data: Ref<DataT>
  encodeDataAttribute: Ref<EncodeDataAttributeFunction | Noop>
  error: Ref<ErrorT | null>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>
  pending: Ref<boolean>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
  sourceMap: Ref<ContentSourceMap | null>
  status: Ref<AsyncDataRequestStatus>
}

/**
 * Copied from Nuxt internals, for use in the `_AsyncSanityData` type
 * @internal
 */
interface AsyncDataExecuteOptions {
  _initial?: boolean
  dedupe?: boolean
}

/**
 * Copied from Nuxt internals, for use in the `_AsyncSanityData` type
 * @internal
 */
type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Return type of `useSanityQuery`
 * @public
 */
export type AsyncSanityData<Data, Error> = _AsyncSanityData<Data, Error>
  & Promise<_AsyncSanityData<Data, Error>>

/**
 * Utility type for a no-op function
 * @internal
 */
export type Noop = () => void

/**
 * The environment in which the app is being previewed
 * @public
 */
export type PreviewEnvironment
  = | 'checking'
    | 'presentation-iframe'
    | 'presentation-window'
    | 'live'
    | 'static'
    | 'unknown'

/**
 * The global sanity helper object
 * @public
 */
export interface SanityHelper {
  client: SanityClient
  config: ClientConfig
  fetch: SanityClient['fetch']
  liveStore?: SanityLiveStore
  queryStore?: QueryStore
  setToken: (token: string) => void
}

/**
 * The response received by `useSanityQuery` when a query is executed
 * @public
 */
export interface SanityQueryResponse<T> {
  data: T
  perspective?: ClientPerspective
  sourceMap?: ContentSourceMap
}

/**
 * @internal
 */
export type SanityLiveStoreSubscriberCallback = (
  tags: string[],
  updateLastLiveEventId: () => void,
) => void

/**
 * @internal
 */
export type SanityLiveStoreSubscriber = (
  queryKey: string,
  callback: SanityLiveStoreSubscriberCallback,
) => {
  getLastLiveEventId: () => string | undefined
  unsubscribe: () => void
}
/**
 * The store used to manage re-execution of live content queries
 * @internal
 */
export interface SanityLiveStore {
  notify: (tags: string[], lastEventId: string) => void
  subscribe: SanityLiveStoreSubscriber
}

/**
 * Options accepted by `useSanityQuery`
 * @internal
 */
export interface UseSanityQueryOptions<T> extends AsyncDataOptions<T> {
  client?: string
  queryOptions?: QueryOptions
  /** @deprecated Use `queryOptions.perspective` instead. */
  perspective?: ClientPerspective
  /** @deprecated Use `queryOptions.stega` instead. */
  stega?: boolean
}

/**
 * `useSanityVisualEditing` configuration object
 * @internal
 */
export interface VisualEditingProps {
  refresh?: SanityVisualEditingRefreshHandler
  zIndex?: SanityVisualEditingZIndex
}

/**
 * Visual editing modes supported by this module
 * @public
 */
export type SanityVisualEditingMode = 'live-visual-editing' | 'visual-editing' | 'custom'

/**
 * Handler function for handling visual editing refreshing events
 * @public
 */
export type SanityVisualEditingRefreshHandler = (
  payload: HistoryRefresh,
  refreshDefault: () => false | Promise<void>,
) => false | Promise<void>

export type SanityRuntimeConfig = {
  liveContent?:
  | {
    serverToken: string
  }
  visualEditing?:
  | {
    previewModeId: string
    token: string
  }
}

/**
 * Module public runtime configuration
 * @public
 */
export type SanityPublicRuntimeConfig = {
  additionalClients: Record<string, ClientConfig>
  apiVersion: string
  dataset: string
  disableSmartCdn: boolean
  liveContent?:
  | {
    browserToken: string | ''
    serverToken: ''
  }
  perspective: ClientPerspective
  projectId: string
  queryEndpoint: string
  stega: StegaConfig
  token: string
  useCdn: boolean
  visualEditing?:
  | {
    mode: SanityVisualEditingMode
    previewMode:
      | false
      | {
        enable?: string
        disable?: string
      }
    previewModeId: ''
    proxyEndpoint: string
    studioUrl: string
    token: ''
    zIndex: SanityVisualEditingZIndex | ''
  }
  withCredentials: boolean
}

/**
 * Module resolved runtime configuration
 * @public
 */
export type SanityResolvedConfig
  = Omit<SanityPublicRuntimeConfig, 'liveContent' | 'visualEditing'>
    & {
      liveContent:
        | null
        | {
          browserToken: string
          serverToken: string | undefined // Private, undefined on public
        }
      visualEditing:
        | null
        | {
          mode: SanityVisualEditingMode
          previewMode:
            | boolean
            | {
              enable?: string
              disable?: string
            }
          previewModeId: string | undefined // Private, undefined on public
          proxyEndpoint: string
          studioUrl: string
          token: string | undefined // Private, undefined on public
          zIndex: SanityVisualEditingZIndex | null
        }
    }

export type SanityVisualEditingZIndex = VisualEditingOptions['zIndex']

export type SanityGroqQueryArray = Array<{ filepath: string, queries: string[] }>

export type SanityGroqQueryMap = Map<string, string[]>

/**
 * Re-export all types from @portabletext/vue
 * Allows users to import portable text types directly from @nuxtjs/sanity
 * without needing to install @portabletext/vue separately
 * @public
 */
export type * from '@portabletext/vue'

/**
 * Re-export types from @portabletext/types
 * These are the core Portable Text type definitions used by components
 * @public
 */
export type * from '@portabletext/types'
