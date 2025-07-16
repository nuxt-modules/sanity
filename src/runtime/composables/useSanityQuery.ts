import type { AsyncData } from 'nuxt/app'
import { hash } from 'ohash'
import { defineEncodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'
import type { EncodeDataAttributeFunction } from '@sanity/core-loader/encode-data-attribute'
import type { ClientConfig, ContentSourceMap, QueryParams, QueryOptions, SanityClient } from '../client'
import type { AsyncSanityData, Noop, SanityQueryResponse, UseSanityQueryOptions } from '../types'
import { createProxyClient } from '../util/createProxyClient'
import { useSanityTagRevalidation } from './internal/useSanityTagRevalidation'
import { useSanityQueryFetcher } from './internal/useSanityQueryFetcher'

const getToken = (
  {
    config,
    client,
    perspective,
  }: {
    config: ReturnType<typeof useSanityConfig>
    client: SanityClient
    perspective: ClientConfig['perspective']
  }) => {
  if (perspective === 'published') {
    return client.config().token || undefined
  }
  if (config.liveContent?.serverToken) {
    return config.liveContent.serverToken
  }
  if (config.visualEditing) {
    return config.visualEditing.token
  }
  return undefined
}

export function useSanityQuery<T = unknown, E = Error>(
  query: string,
  _params?: QueryParams,
  _options: UseSanityQueryOptions<SanityQueryResponse<T | null>> = {},
): AsyncSanityData<T | null, E> {
  const {
    client: _client,
    perspective: _perspective,
    stega: _stega,
    ...options
  } = _options

  // Get configuration
  const sanity = useSanity(_client)
  const config = useSanityConfig()

  const visualEditingState = useSanityVisualEditingState()
  const clientConfig = sanity.client.config()

  const params = _params ? reactive(_params) : undefined
  const queryKey = 'sanity-' + hash(query + (params ? JSON.stringify(params) : ''))

  // Visual editing overrides
  const perspective = useSanityPerspective(_perspective)
  const stega = _stega ?? (
    clientConfig.stega?.enabled
    && typeof clientConfig.stega.studioUrl !== 'undefined'
    && visualEditingState?.enabled
  )

  options.watch = options.watch || []
  options.watch.push(perspective)
  if (params) {
    options.watch.push(params)
  }

  const data = ref<T | null>(null) as Ref<T | null> // Generic must be cast
  const sourceMap = ref<ContentSourceMap | null>(null)
  const encodeDataAttribute = ref<EncodeDataAttributeFunction | Noop>(() => { })

  const updateRefs = (newData: T | null, newSourceMap?: ContentSourceMap) => {
    data.value = newData
    sourceMap.value = newSourceMap || null
    encodeDataAttribute.value = defineEncodeDataAttribute(
      newData,
      newSourceMap,
      config.visualEditing?.studioUrl,
    )
  }

  const client = import.meta.server || perspective.value === 'published'
    ? sanity.client // On the server or fetching published content
    : createProxyClient() // Otherwise use proxy for authenticated requests

  // Handle query updates, using either the query loader or tag based
  // revalidation (Live Content API). The query loader is preferred when in
  // Presentation tool as it will live stream updates over postMessage (via
  // `@sanity/comlink`) and provide the fastest update path. Tag revalidation is
  // slightly slower but does not rely on postMessage events, so is used when
  // not in Presentation tool (for both published and draft data) or when query
  // loaders are disabled.
  let tagRevalidation: ReturnType<typeof useSanityTagRevalidation> | undefined = undefined
  let queryFetcher: ReturnType<typeof useSanityQueryFetcher> | undefined = undefined

  const _inPresentation = useIsSanityPresentationTool()
  watch(_inPresentation, (inPresentation, _wasInPresentation, onCleanup) => {
    onCleanup(() => {
      queryFetcher?.unsubscribe?.()
      tagRevalidation?.unsubscribe()
    })

    // Use the query loader if visual editing is enabled in
    // 'live-visual-editing' mode and we are in the Presentation tool.
    // `isPresentation` can also be null, which indicates we do not yet know if
    // we are in the Presentation tool.
    const enableQueryFetcher = !!(visualEditingState?.enabled && config.visualEditing?.mode === 'live-visual-editing' && inPresentation === true)
    if (enableQueryFetcher) {
      queryFetcher = useSanityQueryFetcher({
        onSnapshot: updateRefs,
        params,
        query,
        queryStore: sanity.queryStore,
      })
      return
    }
    // Use tag revalidation if live content is enabled, and we are either on the
    // server or on the client and the query loader is explicitly disabled (i.e.
    // false, not null)
    if (config.liveContent && (import.meta.server || !enableQueryFetcher)) {
      tagRevalidation = useSanityTagRevalidation({
        client,
        liveStore: sanity.liveStore,
        queryKey,
      })
    }
  }, { immediate: true })

  const result = useAsyncData(queryKey, async () => {
    const useCdn = perspective.value === 'published'
    const token = getToken({
      config,
      client,
      perspective: perspective.value,
    })

    const options = {
      cacheMode: useCdn ? 'noStale' : undefined,
      filterResponse: false,
      lastLiveEventId: tagRevalidation?.getLastLiveEventId(),
      perspective: perspective.value,
      resultSourceMap: 'withKeyArraySelector',
      stega,
      token,
      useCdn,
    } satisfies QueryOptions

    await tagRevalidation?.fetchTags(query, params, options)

    const { result, resultSourceMap } = await client.fetch<T>(query, params || {}, options)

    updateRefs(result, resultSourceMap)
    return { data: result, sourceMap: resultSourceMap }
  }, options) as AsyncData<SanityQueryResponse<T | null>, E>

  return Object.assign(new Promise((resolve) => {
    result.then((value) => {
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
