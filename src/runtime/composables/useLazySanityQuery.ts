import { hash } from 'ohash'
import type { AsyncData } from 'nuxt/app'
import type { ClientReturn } from '@sanity/client'
import type { QueryParams } from '../client'
import type { UseSanityQueryOptions } from '../types'
import { reactive } from 'vue'
import { useLazyAsyncData } from '#imports'
import { useSanity } from './useSanity'

export function useLazySanityQuery<const Q extends string, E = Error>(
  query: Q,
  _params?: QueryParams,
  _options?: UseSanityQueryOptions<ClientReturn<Q, unknown> | null>,
): AsyncData<ClientReturn<Q, unknown> | null, E>

export function useLazySanityQuery<T = unknown, E = Error>(
  query: string,
  _params?: QueryParams,
  _options?: UseSanityQueryOptions<T | null>,
): AsyncData<T | null, E>

export function useLazySanityQuery<T = unknown, E = Error>(
  query: string,
  _params?: QueryParams,
  _options: UseSanityQueryOptions<T | null> = {},
): AsyncData<T | null, E> {
  const { client, key, ...options } = _options
  const sanity = useSanity(client)
  const params = _params ? reactive(_params) : undefined

  if (params) {
    options.watch = options.watch || []
    options.watch.push(params)
  }

  return useLazyAsyncData(
    key || 'sanity-' + hash(query + (params ? JSON.stringify(params) : '')),
    () => sanity.fetch<T>(query, params || {}),
    options,
  ) as AsyncData<T | null, E>
}
