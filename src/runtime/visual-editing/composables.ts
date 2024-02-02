import { defu } from 'defu'
import { hash } from 'ohash'
import { type Ref, reactive } from 'vue'
import {
  createQueryStore as createCoreQueryStore,
  type QueryStore,
  type QueryStoreState,
} from '@sanity/core-loader'
import {
  defineEncodeDataAttribute,
  type EncodeDataAttributeFunction,
} from '@sanity/core-loader/encode-data-attribute'
import type {
  ClientPerspective,
  ContentSourceMap,
  QueryParams,
} from '@sanity/client'
import { enableOverlays } from '@sanity/overlays'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { SanityConfiguration } from '#build/sanity-config'
import type { SanityClient } from '#sanity-client/types'
import {
  createSanityClient,
  useNuxtApp,
  useRuntimeConfig,
  useAsyncData,
} from '#imports'

export interface SanityVisualEditingConfiguration {
  draftMode:
    | boolean
    | {
        enable?: string
        disable?: string
      }
  mode: 'global' | 'component'
  token?: string
  studioUrl: string
  draftModeId?: string
}

export interface SanityHelperConfiguration extends SanityConfiguration {
  visualEditing?: SanityVisualEditingConfiguration
}

export interface SanityHelper {
  client: SanityClient
  config: SanityHelperConfiguration
  fetch: SanityClient['fetch']
  setToken: (token: string) => void
  queryStore?: QueryStore
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
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<{
    data: DataT
    sourceMap?: ContentSourceMap | null
  }>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<{
    data: DataT
    sourceMap?: ContentSourceMap | null
  }>
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
  const { visualEditing, ...clientConfig } = config;
  let client = createSanityClient(clientConfig)

  const visualEditingEnabled =
    visualEditing &&
    (!visualEditing.draftMode || useState('_sanity_visualEditing').value)

  let queryStore = visualEditingEnabled
    ? createQueryStore(visualEditing, client)
    : undefined

  return {
    client,
    config,
    // @ts-expect-error
    fetch: (...args) => client.fetch(...args),
    queryStore,
    setToken(token) {
      config.token = token
      client = createSanityClient(clientConfig)
      if (queryStore && visualEditing) {
        queryStore = createQueryStore(visualEditing, client)
      }
    },
  }
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
    } as SanityConfiguration) // @todo casting
    return nuxtApp._sanity.default
  }

  nuxtApp._sanity[client] = createSanityHelper(
    defu(additionalClients[client], options),
  )
  return nuxtApp._sanity[client]
}

export const useSanityQuery = <T = unknown, E = Error>(
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
        const data = await sanity.fetch<T>(query, params || {}, {
          perspective,
        })
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

    result = useAsyncData<SanityQueryResponse<T | null>, E>(
      queryKey,
      async () => {
        if (import.meta.server) {
          const client =
            sanity.queryStore!.unstable__serverClient.instance || sanity.client
          const { result: data, resultSourceMap: sourceMap } =
            await client.fetch<T>(query, params || {}, {
              perspective,
              filterResponse: false,
              resultSourceMap: 'withKeyArraySelector',
            })
          return sourceMap ? { data, sourceMap } : { data }
        } else {
          return new Promise<{
            data: T | null
            sourceMap: ContentSourceMap | undefined
          }>(resolve => {
            setupFetcher(newSnapshot => {
              resolve({
                data: newSnapshot.data || null,
                sourceMap: newSnapshot.sourceMap,
              })
            })
          })
        }
      },
      options,
    ) as AsyncData<SanityQueryResponse<T | null>, E>

    if (result.status.value === 'success' && import.meta.client) {
      setupFetcher()
    }

    onScopeDispose(unsubscribe)
  }

  return new Promise(resolve => {
    result.then(value => {
      updateRefs(value.data.value.data, value.data.value.sourceMap)
      resolve({
        ...result,
        data,
        sourceMap,
        encodeDataAttribute,
      })
    })
  }) as AsyncSanityData<T | null, E>
}

export function useSanityLiveMode({ client = 'default' }: { client?: string }) {
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

export function useSanityOverlays() {
  let disable = () => {}

  if (import.meta.client) {
    const router = useRouter()
    disable = enableOverlays({
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

  onScopeDispose(() => {
    disable()
  })

  return disable
}

export function useSanityVisualEditing(
  options: { client?: string } | Array<{ client?: string }> = {},
) {
  const _options = Array.isArray(options) ? options : [options]

  useSanityOverlays()

  _options.forEach(option => {
    useSanityLiveMode(option)
  })
}
