import { defu } from 'defu'
import { useRuntimeConfig } from 'nuxt/server'
import type { RequestEvent } from 'nuxt/server'

import type { ClientConfig } from '../../client'
import { createClient } from '../../client'
import type { SanityHelper } from '../../types'

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

export function useSanity(event?: RequestEvent, client?: string): SanityHelper
/** @deprecated prefer useSanity(event, client) */
export function useSanity(client?: string): SanityHelper
export function useSanity(_event?: RequestEvent | string, _client?: string): SanityHelper {
  const client = (typeof _event === 'string' ? _event : _client) || 'default'
  if (client in clients) {
    return clients[client]!
  }

  const $config = useRuntimeConfig()

  const sanityConfig = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)
  const {
    additionalClients = {},
    liveContent,
    visualEditing,
    ...options
  } = sanityConfig

  if (client === 'default') {
    clients.default = createSanityHelper(options as ClientConfig) // @todo casting
    return clients.default
  }

  clients[client] = createSanityHelper(defu(additionalClients[client], options))
  return clients[client]
}
