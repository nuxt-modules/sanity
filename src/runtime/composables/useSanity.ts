import defu from 'defu'
import { createQueryStore as createCoreQueryStore } from '@sanity/core-loader'
import type { SanityClient } from '@sanity/client'
import type { ClientConfig } from '../client'
import type { SanityHelper, SanityResolvedConfig } from '../../types'

const createQueryStore = (
  visualEditing: SanityResolvedConfig['visualEditing'],
  client: SanityClient,
  tag?: string,
) => {
  if (!visualEditing) return undefined

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

const createTagStore = (liveContent: SanityResolvedConfig['liveContent']) => {
  if (!liveContent) return undefined

  const subscribers = new Set<(tags: string[]) => void>()
  return {
    notify(tags: string[]) {
      subscribers.forEach(callback => callback(tags))
    },
    subscribe(callback: (tags: string[]) => void) {
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
  }
}

const createSanityHelper = (clientConfig: ClientConfig): SanityHelper => {
  const sanityConfig = useSanityConfig()
  const config = { ...clientConfig }

  let client = createSanityClient(config)
  let queryStore = createQueryStore(sanityConfig.visualEditing, client)
  const tagStore = createTagStore(sanityConfig.liveContent)

  return {
    client,
    config,
    // @ts-expect-error untyped args
    fetch: (...args) => client.fetch(...args),
    queryStore,
    setToken(token) {
      config.token = token
      client = createSanityClient(config)
      if (queryStore && sanityConfig.visualEditing) {
        queryStore = createQueryStore(sanityConfig.visualEditing, client)
      }
    },
    tagStore,
  }
}

export const useSanity = (client = 'default'): SanityHelper => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp._sanity?.[client]) {
    return nuxtApp._sanity[client]
  }

  nuxtApp._sanity = nuxtApp._sanity || {}

  const sanityConfig = useSanityConfig()
  const { additionalClients = {}, liveContent, visualEditing, ...options } = sanityConfig

  if (!options.disableSmartCdn && nuxtApp.$preview) {
    options.useCdn = false
  }
  else if (!import.meta.dev && !options.useCdn && !options.token) {
    options.useCdn = true
  }

  if (client === 'default') {
    nuxtApp._sanity.default = createSanityHelper(options as ClientConfig) // @todo casting
    return nuxtApp._sanity.default
  }

  nuxtApp._sanity[client] = createSanityHelper(defu(additionalClients[client], options))
  return nuxtApp._sanity[client]
}
