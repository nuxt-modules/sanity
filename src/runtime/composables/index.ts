import { defu } from 'defu'
import { hash } from 'ohash'
import { reactive } from 'vue'

import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { SanityClient, ClientConfig } from '../client'
import { useNuxtApp, useRuntimeConfig, useAsyncData, useLazyAsyncData, createSanityClient } from '#imports'

export interface SanityHelper {
  client: SanityClient
  config: ClientConfig
  fetch: SanityClient['fetch']
  setToken: (token: string) => void
}

const createSanityHelper = (options: ClientConfig): SanityHelper => {
  const config = { ...options }
  let client = createSanityClient(config)

  return {
    client,
    config,
    // @ts-expect-error
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
    nuxtApp._sanity.default = createSanityHelper(options as ClientConfig) // @todo casting
    return nuxtApp._sanity.default
  }

  nuxtApp._sanity[client] = createSanityHelper(defu(additionalClients[client], options))
  return nuxtApp._sanity[client]
}

interface UseSanityQueryOptions<T> extends AsyncDataOptions<T> {
  client?: string
}

export const useSanityQuery = <T = unknown, E = Error> (query: string, _params?: Record<string, any>, _options: UseSanityQueryOptions<T> = {}): AsyncData<T | null, E> => {
  const { client, ...options } = _options
  const sanity = useSanity(client)
  const params = _params ? reactive(_params) : undefined
  if (params) {
    options.watch = options.watch || []
    options.watch.push(params)
  }
  return useAsyncData('sanity-' + hash(query + (params ? JSON.stringify(params) : '')), () => sanity.fetch<T>(query, params || {}), options) as AsyncData<T | null, E>
}

export const useLazySanityQuery = <T = unknown, E = Error> (query: string, _params?: Record<string, any>, _options: UseSanityQueryOptions<T> = {}): AsyncData<T | null, E> => {
  const { client, ...options } = _options
  const sanity = useSanity(client)
  const params = _params ? reactive(_params) : undefined
  if (params) {
    options.watch = options.watch || []
    options.watch.push(params)
  }
  return useLazyAsyncData('sanity-' + hash(query + (params ? JSON.stringify(params) : '')), () => sanity.fetch<T>(query, params || {}), options) as AsyncData<T | null, E>
}
