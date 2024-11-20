import { defu } from 'defu'

import type { ClientConfig } from '../../client'
import { createClient } from '../../client'
import type { SanityHelper } from '#sanity-composables'

import { useRuntimeConfig } from '#imports'

const clients: Record<string, SanityHelper> = {}

const createSanityHelper = (options: ClientConfig): SanityHelper => {
  const config = { ...options }
  let client = createClient(config)

  return {
    client,
    config,
    fetch: client.fetch.bind(client),
    setToken(token) {
      config.token = token
      client = createClient(config)
    },
  }
}

export const useSanity = (client = 'default'): SanityHelper => {
  const $config = useRuntimeConfig()
  if (client in clients) {
    return clients[client]
  }

  const {
    additionalClients = {},

    visualEditing,
    ...options
  } = defu($config.sanity, $config.public.sanity)

  if (client === 'default') {
    clients.default = createSanityHelper(options as ClientConfig) // @todo casting
    return clients.default
  }

  clients[client] = createSanityHelper(defu(additionalClients[client], options))
  return clients[client]
}
