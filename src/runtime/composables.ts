import { defu } from 'defu'
import { objectHash } from 'ohash'

import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { SanityClient, SanityConfiguration } from './client'
import { useNuxtApp, useRuntimeConfig, useAsyncData, useLazyAsyncData, createSanityClient } from '#imports'

export interface SanityHelper {
  client: SanityClient
  config: SanityConfiguration
  fetch: SanityClient['fetch']
  setToken: (token: string) => void
}

const createSanityHelper = (options: SanityConfiguration): SanityHelper => {
  const config = options
  let client = createSanityClient(config)

  return {
    client,
    config,
    fetch: (...args) => client.fetch(...args),
    setToken (token) {
      config.token = token
      client = createSanityClient(config)
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
  const { additionalClients = {}, ...options } = defu($config.sanity, $config.public.sanity)

  if (!options.disableSmartCdn && nuxtApp.$preview) {
    options.useCdn = false
  }

  if (client === 'default') {
    nuxtApp._sanity.default = createSanityHelper(options)
    return nuxtApp._sanity.default
  }

  nuxtApp._sanity[client] = createSanityHelper(defu(additionalClients[client], options))
  return nuxtApp._sanity[client]
}

interface UseSanityQueryOptions<T> extends AsyncDataOptions<T> {
  client?: string
}

export const useSanityQuery = <T = unknown>(query: string, params?: Record<string, any>, options: UseSanityQueryOptions<T> = {}): AsyncData<T, Error | null | true> => {
  const { client, ..._options } = options
  const sanity = useSanity(client)
  return useAsyncData<T>('sanity-' + objectHash(query + (params ? JSON.stringify(params) : '')), () => sanity.fetch(query, params), _options)
}

export const useLazySanityQuery = <T = unknown>(query: string, params?: Record<string, any>, options: UseSanityQueryOptions<T> = {}): AsyncData<T, Error | null | true> => {
  const { client, ..._options } = options
  const sanity = useSanity(client)
  return useLazyAsyncData<T>('sanity-' + objectHash(query + (params ? JSON.stringify(params) : '')), () => sanity.fetch(query, params), _options)
}
