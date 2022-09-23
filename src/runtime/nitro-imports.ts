import { defu } from 'defu'

import type { SanityConfiguration } from './client'
import type { SanityHelper } from './composables'

import { useRuntimeConfig } from '#imports'
import { createClient } from '#sanity-client'

const clients: Record<string, SanityHelper> = {}
const $config = useRuntimeConfig()

const createSanityHelper = (options: SanityConfiguration): SanityHelper => {
  const config = { ...options }
  let client = createClient(config)

  return {
    client,
    config,
    fetch: (...args) => client.fetch(...args),
    setToken (token) {
      config.token = token
      client = createClient(config)
    },
  }
}

export const useSanity = (client = 'default'): SanityHelper => {
  if (client in clients) {
    return clients[client]
  }

  const { additionalClients = {}, ...options } = defu($config.sanity, $config.public.sanity)

  if (client === 'default') {
    clients.default = createSanityHelper(options)
    return clients.default
  }

  clients[client] = createSanityHelper(defu(additionalClients[client], options))
  return clients[client]
}
