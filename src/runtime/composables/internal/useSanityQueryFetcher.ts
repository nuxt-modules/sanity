import type { QueryStore, QueryStoreState } from '@sanity/core-loader'
import type { ContentSourceMap, QueryParams } from '../../client'

/**
 * Internal composable used to setup update streaming from Presentation tool
 * over postMessage (via `@sanity/comlink`).
 * @internal
 */
export const useSanityQueryFetcher = <T = unknown, E = Error>(
  {
    onSnapshot,
    params,
    query,
    queryStore,
  }: {
    onSnapshot: (data: T, sourceMap: ContentSourceMap | undefined) => void
    params?: QueryParams
    query: string
    queryStore?: QueryStore
  }) => {
  let unsubscribe = () => { }

  if (import.meta.client && queryStore) {
    const setupFetcher = (
      cb?: (state: Readonly<QueryStoreState<T, E>>) => void,
    ) => {
      const fetcher = queryStore.createFetcherStore<T, E>(
        query,
        params ? JSON.parse(JSON.stringify(params)) : undefined,
        undefined,
      )

      const unsubscribe = fetcher.subscribe((newSnapshot) => {
        if (newSnapshot.data) {
          onSnapshot(newSnapshot.data as unknown as T, newSnapshot.sourceMap)
          cb?.(newSnapshot)
        }
      })

      return unsubscribe
    }

    unsubscribe = setupFetcher()
    if (params) {
      watch(params, (_a, _b, onCleanup) => {
        onCleanup(() => unsubscribe())
        unsubscribe = setupFetcher()
      })
    }
  }

  return { unsubscribe }
}
