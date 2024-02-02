import { defu } from 'defu'

import type { SanityConfiguration } from '#build/sanity-config'
import type { SanityHelper } from '#sanity-composables'

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
    clients.default = createSanityHelper(options as SanityConfiguration) // @todo casting
    return clients.default
  }

  clients[client] = createSanityHelper(defu(additionalClients[client], options))
  return clients[client]
}
