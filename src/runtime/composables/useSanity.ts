import defu from 'defu'
import type { ClientConfig } from '../client'
import type { SanityHelper } from '../../types'
import { createLiveStore } from '../util/createLiveStore'
import { createQueryStore } from '../util/createQueryStore'

const createSanityHelper = (clientConfig: ClientConfig): SanityHelper => {
  const sanityConfig = useSanityConfig()
  const config = { ...clientConfig }

  let client = createSanityClient(config)
  let queryStore = createQueryStore(sanityConfig.visualEditing, client)
  const liveStore = createLiveStore(sanityConfig.liveContent)

  return {
    client,
    config,
    // @ts-expect-error untyped args
    fetch: (...args) => client.fetch(...args),
    liveStore,
    queryStore,
    setToken(token) {
      config.token = token
      client = createSanityClient(config)
      if (queryStore && sanityConfig.visualEditing) {
        queryStore = createQueryStore(sanityConfig.visualEditing, client)
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
