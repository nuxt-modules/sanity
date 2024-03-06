import { defu } from 'defu'

import type { SanityHelper } from '#sanity-composables'

import { useRuntimeConfig } from '#imports'

import type { ClientConfig } from '../../client'
import { createClient } from '../../client'

const clients: Record<string, SanityHelper> = {}
const $config = useRuntimeConfig()

const createSanityHelper = (options: ClientConfig): SanityHelper => {
  const config = { ...options }
  let client = createClient(config)

  return {
    client,
    config,
    fetch: client.fetch,
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

  const {
    additionalClients = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
