import { defu } from 'defu'
import { hash } from 'ohash'
import { onScopeDispose, reactive, ref } from 'vue'
import { createQueryStore as createCoreQueryStore } from '@sanity/core-loader'
import { defineEncodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'
import { enableVisualEditing } from '@sanity/visual-editing'

import type { Ref } from 'vue'
import type { QueryStore, QueryStoreState } from '@sanity/core-loader'
import type { EncodeDataAttributeFunction } from '@sanity/core-loader/encode-data-attribute'
import type { ClientPerspective, ContentSourceMap, QueryParams, UnfilteredResponseQueryOptions } from '@sanity/client'

import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { ClientConfig, SanityClient } from '../client'
import type { SanityVisualEditingMode, SanityVisualEditingRefreshHandler, SanityVisualEditingZIndex } from '../../module'

import { createSanityClient, useNuxtApp, useRuntimeConfig, useAsyncData, useRouter, useState, reloadNuxtApp } from '#imports'

export interface SanityVisualEditingConfiguration {
  mode: SanityVisualEditingMode,
  previewMode:
  | boolean
  | {
    enable?: string
    disable?: string
  }
  previewModeId?: string
  proxyEndpoint: string
  refresh?: SanityVisualEditingRefreshHandler
  studioUrl: string
  token?: string
  zIndex?: SanityVisualEditingZIndex
}

export interface SanityHelperConfiguration extends ClientConfig {
  visualEditing?: SanityVisualEditingConfiguration
}

export interface SanityHelper {
  client: SanityClient
  config: SanityHelperConfiguration
  fetch: SanityClient['fetch']
  setToken: (token: string) => void
  queryStore?: QueryStore
}

export interface VisualEditingProps {
  refresh?: SanityVisualEditingRefreshHandler
  zIndex?: SanityVisualEditingZIndex
}

type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'
interface AsyncDataExecuteOptions {
  _initial?: boolean
  dedupe?: boolean
}

interface UseSanityQueryOptions<T> extends AsyncDataOptions<T> {
  client?: string
  perspective?: 'previewDrafts' | 'published' | 'raw'
}

interface SanityQueryResponse<T> {
  data: T
  sourceMap?: ContentSourceMap
  perspective?: ClientPerspective
}

type Noop = () => void

interface _AsyncSanityData<DataT, ErrorT> {
  data: Ref<DataT>
  sourceMap: Ref<ContentSourceMap | null>
  encodeDataAttribute: Ref<EncodeDataAttributeFunction | Noop>
  pending: Ref<boolean>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>
  error: Ref<ErrorT | null>
  status: Ref<AsyncDataRequestStatus>
}

export type AsyncSanityData<Data, Error> = _AsyncSanityData<Data, Error> &
  Promise<_AsyncSanityData<Data, Error>>

const createQueryStore = (
  visualEditing: SanityVisualEditingConfiguration,
  client: SanityClient,
  tag?: string,
) => {
  const queryStore = createCoreQueryStore({
    tag: tag || 'nuxt-loader',
    client: false,
    ssr: true,
  })

  if (import.meta.server) {
    const serverClient = client.withConfig({
      perspective: 'previewDrafts',
      token: visualEditing?.token,
      useCdn: false,
    })
    queryStore.setServerClient(serverClient)
  }

  return queryStore
}

const createSanityHelper = (
  options: SanityHelperConfiguration,
): SanityHelper => {
  const config = { ...options }
  const { visualEditing, ...clientConfig } = config
  let client = createSanityClient(clientConfig)

  const visualEditingState = useSanityVisualEditingState()
  const visualEditingEnabled = visualEditing && (!visualEditing.previewMode || visualEditingState.enabled)

  let queryStore = visualEditingEnabled
    ? createQueryStore(visualEditing, client)
    : undefined

  return {
    client,
    config,
    // @ts-expect-error
    fetch: (...args) => client.fetch(...args),
    queryStore,
    setToken (token) {
      config.token = token
      client = createSanityClient(clientConfig)
      if (queryStore && visualEditing) {
        queryStore = createQueryStore(visualEditing, client)
      }
    },
  }
}

export const useSanityVisualEditingState = () => {
  const enabled = useState('_sanity_visualEditing', () => false)

  return reactive({
    enabled,
    inFrame: isInFrame(),
  })
}

const isInFrame = () => {
  // Return undefined if on server
  if (import.meta.server) return undefined
  return !!(window.self !== window.top || window.opener)
}


export const useSanity = (client = 'default'): SanityHelper => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp._sanity?.[client]) {
    return nuxtApp._sanity[client]
  }

  nuxtApp._sanity = nuxtApp._sanity || {}

  const $config = useRuntimeConfig()
  const { additionalClients = {}, visualEditing, ...options } = defu(
    $config.sanity,
    $config.public.sanity,
  )

  if (client === 'default') {
    nuxtApp._sanity.default = createSanityHelper({
      ...options,
      visualEditing: visualEditing || undefined,
    } as ClientConfig) // @todo casting
    return nuxtApp._sanity.default
  }

  nuxtApp._sanity[client] = createSanityHelper(
    defu(additionalClients[client], options),
  )
  return nuxtApp._sanity[client]
}

export const useSanityQuery = <T = unknown, E = Error> (
  query: string,
  _params?: QueryParams,
  _options: UseSanityQueryOptions<SanityQueryResponse<T | null>> = {},
): AsyncSanityData<T | null, E> => {
  const { client, perspective: _perspective, ...options } = _options
  const sanity = useSanity(client)
  const params = _params ? reactive(_params) : undefined
  if (params) {
    options.watch = options.watch || []
    options.watch.push(params)
  }

  const perspective = (
    _perspective || sanity.queryStore ? 'previewDrafts' : 'published'
  ) as ClientPerspective

  const queryKey =
    'sanity-' + hash(query + (params ? JSON.stringify(params) : ''))

  const data = ref<T | null>(null) as Ref<T | null> // Generic must be cast
  const sourceMap = ref<ContentSourceMap | null>(null)
  const encodeDataAttribute = ref<EncodeDataAttributeFunction | Noop>(() => {})
  const updateRefs = (newData: T | null, newSourceMap?: ContentSourceMap) => {
    data.value = newData
    sourceMap.value = newSourceMap || null
    encodeDataAttribute.value = defineEncodeDataAttribute(
      newData,
      newSourceMap,
      sanity.config.visualEditing?.studioUrl,
    )
  }

  let result: AsyncData<SanityQueryResponse<T | null>, E>

  if (!sanity.queryStore) {
    result = useAsyncData<SanityQueryResponse<T | null>, E>(
      queryKey,
      async () => {
        const data = await sanity.fetch<T>(query, params || {}, { perspective })
        return { data }
      },
      options,
    ) as AsyncData<SanityQueryResponse<T | null>, E>
  } else {
    let unsubscribe = () => {}

    const setupFetcher = (
      cb?: (state: Readonly<QueryStoreState<T, E>>) => void,
    ) => {
      unsubscribe()

      const fetcher = sanity.queryStore!.createFetcherStore<T, E>(
        query,
        _params,
        undefined,
      )

      unsubscribe = fetcher.subscribe(newSnapshot => {
        if (newSnapshot.data) {
          updateRefs(newSnapshot.data as unknown as T, newSnapshot.sourceMap)
          cb?.(newSnapshot)
        }
      })
    }

    const proxyClient = {
      fetch: <T> (
        query: string,
        params: QueryParams,
        options: UnfilteredResponseQueryOptions,
      ): Promise<{ result: T, resultSourceMap: ContentSourceMap }> =>
        $fetch(sanity.config.visualEditing!.proxyEndpoint, {
          method: 'POST',
          body: { query, params, options },
        }),
    }

    result = useAsyncData<SanityQueryResponse<T | null>, E>(
      queryKey,
      async () => {
        const client = import.meta.server
          // Used on initial render
          ? (sanity.queryStore!.unstable__serverClient.instance || sanity.client)
          // Used on subsequent page navigations, we need to proxy the request
          // so we can fetch data using credentials
          : proxyClient as SanityClient

        const { result: data, resultSourceMap: sourceMap } =
          await client.fetch<T>(query, params || {}, {
            perspective,
            filterResponse: false,
            resultSourceMap: 'withKeyArraySelector',
          })

        return sourceMap ? { data, sourceMap } : { data }
      },
      options,
    ) as AsyncData<SanityQueryResponse<T | null>, E>

    // On the client, setup the fetcher
    if (import.meta.client) {
      setupFetcher()
    }

    onScopeDispose(unsubscribe)
  }

  return Object.assign(new Promise(resolve => {
    result.then(value => {
      updateRefs(value.data.value.data, value.data.value.sourceMap)
      resolve({
        ...result,
        data,
        sourceMap,
        encodeDataAttribute,
      })
    })
  }), { ...result, data, sourceMap, encodeDataAttribute }) as AsyncSanityData<T | null, E>
}

export function useSanityLiveMode (options?: { client?: string }) {
  const { client = 'default' } = options || {}

  let disable = () => {}

  if (import.meta.client) {
    const sanity = useSanity(client)
    if (sanity.queryStore) {
      disable = sanity.queryStore.enableLiveMode({
        client: sanity.client,
      })
    }
  }

  onScopeDispose(disable)

  return disable
}

export function useSanityVisualEditing (
  options: VisualEditingProps = {},
) {
  const { zIndex, refresh } = options

  let disable = () => {}

  if (import.meta.client) {
    const router = useRouter()
    disable = enableVisualEditing({
      zIndex,
      // It is unlikely this API will be used as much by Nuxt users, as
      // implementing fully fledged visual editing is more straightforward
      // compared with other frameworks
      refresh: (payload) => {
        function refreshDefault () {
          if (payload.source === 'mutation' && payload.livePreviewEnabled) {
            // If live mode is enabled, the loader should handle updates via
            // `useQuery`, so we can ignore it here
            return false
          }
          return new Promise<void>((resolve) => {
            // Nuxt’s data fetching happens on both client and server, therefore
            // the default refresh mechanism is necessarily more of a brute
            // force solution. It would be preferable to use something like
            // `refreshNuxtData` here if we could use it to trigger a refetch of
            // data using the server Sanity client instance
            reloadNuxtApp({ ttl: 1000 })
            resolve()
          })
        }
        return refresh ? refresh(payload, refreshDefault) : refreshDefault()
      },
      history: {
        subscribe: navigate => {
          router.isReady().then(() => {
            navigate({
              type: 'replace',
              url: router.currentRoute.value.fullPath,
            })
          })
          return router.afterEach(to => {
            // There is no mechanism to determine navigation type in a Vue Router navigation guard, so just push
            // https://github.com/vuejs/vue-router/issues/1620
            navigate({ type: 'push', url: to.fullPath })
          })
        },
        update: update => {
          if (update.type === 'push' || update.type === 'replace') {
            router[update.type](update.url)
          } else if (update.type === 'pop') {
            router.back()
          }
        },
      },
    })
  }

  onScopeDispose(disable)

  return disable
}
