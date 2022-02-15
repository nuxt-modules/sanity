import defu from 'defu'

import { useNuxtApp, useRuntimeConfig } from '#app'
import type { SanityClient, SanityConfiguration } from './client'

import { createSanityClient } from '#imports'

interface Client {
  client: SanityClient
  config: SanityConfiguration
  fetch: SanityClient['fetch']
  setToken: (token: string) => void
}

const createSanityHelper = (options: SanityConfiguration): Client => {
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

export const useSanity = (client = 'default'): Client => {
  const nuxtApp = useNuxtApp()
  if (nuxtApp._sanity?.[client]) {
    return nuxtApp._sanity[client]
  }

  nuxtApp._sanity = nuxtApp._sanity || {}

  const $config = useRuntimeConfig()
  const { additionalClients = {}, ...options } = $config.sanity

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
