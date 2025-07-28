import { hash } from 'ohash'
import type { AsyncData } from 'nuxt/app'
import type { UseSanityQueryOptions } from '../types'
import { reactive } from 'vue'
import { useLazyAsyncData } from '#imports'
import { useSanity } from './useSanity'

export const useLazySanityQuery = <T = unknown, E = Error> (query: string, _params?: Record<string, unknown>, _options: UseSanityQueryOptions<T> = {}): AsyncData<T | null, E> => {
  const { client, ...options } = _options
  const sanity = useSanity(client)
  const params = _params ? reactive(_params) : undefined
  if (params) {
    options.watch = options.watch || []
    options.watch.push(params)
  }
  return useLazyAsyncData('sanity-' + hash(query + (params ? JSON.stringify(params) : '')), () => sanity.fetch<T>(query, params || {}), options) as AsyncData<T | null, E>
}
