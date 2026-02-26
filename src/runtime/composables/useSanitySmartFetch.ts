import type { AsyncData } from 'nuxt/app'
import { hash } from 'ohash'
import { defineEncodeDataAttribute } from '@sanity/core-loader/encode-data-attribute'
import type { EncodeDataAttributeFunction } from '@sanity/core-loader/encode-data-attribute'
import type { ClientReturn } from '@sanity/client'
import { useAsyncData } from '#imports'
import { reactive, ref, watch, type Ref } from 'vue'
import type { ClientConfig, ContentSourceMap, QueryParams, QueryOptions, SanityClient } from '../client'
import type { AsyncSanityData, Noop, SanityQueryResponse, UseSanityQueryOptions } from '../types'
import { useSanity } from './useSanity'
import { useSanityConfig } from './useSanityConfig'
import { useIsSanityPresentationTool } from './useIsSanityPresentationTool'
import { useSanityPerspective } from './useSanityPerspective'
import { useSanityVisualEditingState } from './useSanityVisualEditingState'
import { createForwardingClient } from '../util/createForwardingClient'
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

/**
 * A hybrid data-fetching composable that combines the performance of
 * server-side CDN-cached queries with full Sanity Visual Editing / Presentation
 * Tool support.
 *
 * On SSR and on the client when preview is inactive it uses the fast, public
 * CDN endpoint (no token exposed). When the Presentation Tool activates
 * preview mode the client is switched to the authenticated proxy endpoint with
 * stega encoding and live updates — all within the same `useAsyncData` key so
 * no hydration mismatch occurs.
 *
 * The API is identical to `useSanityQuery` so it can be used as a drop-in
 * opt-in alternative for pages that need both fast SSR and live editing.
 *
 * @example
 * ```ts
 * // Works fast on SSR; switches to preview client when opened in Presentation Tool
 * const { data, encodeDataAttribute } = await useSanitySmartFetch<Product>(
 *   `*[_type == "product" && slug.current == $slug][0]`,
 *   { slug: route.params.slug },
 * )
 * ```
 *
 * @public
 */
export function useSanitySmartFetch<const Q extends string, E = Error>(
  query: Q,
  _params?: QueryParams,
  _options?: UseSanityQueryOptions<SanityQueryResponse<ClientReturn<Q, unknown> | null>>,
): AsyncSanityData<ClientReturn<Q, unknown> | null, E>

export function useSanitySmartFetch<T = unknown, E = Error>(
  query: string,
  _params?: QueryParams,
  _options?: UseSanityQueryOptions<SanityQueryResponse<T | null>>,
): AsyncSanityData<T | null, E>

export function useSanitySmartFetch<T = unknown, E = Error>(
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
  const queryKey = 'sanity-smart-' + hash(query + (params ? JSON.stringify(params) : ''))

  const perspective = useSanityPerspective(_perspective, clientConfig.perspective)

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
        client: sanity.client,
        liveStore: sanity.liveStore,
        queryKey,
      })
    }
  }, { immediate: true })

  const result = useAsyncData(queryKey, async () => {
    // Resolve perspective and enabled state reactively inside the callback.
    // This is the key difference from `useSanityQuery`: the client is selected
    // on every invocation so that activating Presentation Tool preview mid-session
    // (which changes `perspective` and triggers a refetch) correctly switches to
    // the authenticated proxy endpoint rather than reusing a stale client captured
    // at composable-setup time.
    const currentPerspective = perspective.value
    const currentEnabled = visualEditingState?.enabled ?? false

    const useCdn = currentPerspective === 'published'
    const token = getToken({
      config,
      client: sanity.client,
      perspective: currentPerspective,
    })

    // Select the appropriate client reactively based on current preview state.
    // On SSR import.meta.client is false, so the public CDN client is always
    // used during server rendering regardless of preview state.
    const client: SanityClient = config.visualEditing && currentEnabled
      && import.meta.client && currentPerspective !== 'published'
      ? createForwardingClient(config.visualEditing.proxyEndpoint)
      : config.queryEndpoint
        ? createForwardingClient(config.queryEndpoint)
        : sanity.client

    const stega = _stega ?? (
      clientConfig.stega?.enabled
      && typeof clientConfig.stega.studioUrl !== 'undefined'
      && currentEnabled
    )

    const fetchOptions = {
      cacheMode: useCdn ? 'noStale' : undefined,
      filterResponse: false,
      lastLiveEventId: tagRevalidation?.getLastLiveEventId(),
      perspective: currentPerspective,
      resultSourceMap: 'withKeyArraySelector',
      stega,
      token,
      useCdn,
    } satisfies QueryOptions

    await tagRevalidation?.fetchTags(query, params, fetchOptions)

    const { result, resultSourceMap } = await client.fetch<T>(query, params || {}, fetchOptions)

    updateRefs(result, resultSourceMap)
    return { data: result, sourceMap: resultSourceMap } satisfies SanityQueryResponse<T>
  }, options) as AsyncData<SanityQueryResponse<T | null> | undefined, E>

  return Object.assign(new Promise((resolve) => {
    result.then((value) => {
      if (value.data.value) {
        updateRefs(value.data.value.data, value.data.value.sourceMap)
      }
      resolve({
        ...result,
        data,
        sourceMap,
        encodeDataAttribute,
      })
    })
  }), { ...result, data, sourceMap, encodeDataAttribute }) as AsyncSanityData<T | null, E>
}
