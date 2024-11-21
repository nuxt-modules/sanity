import { defu } from 'defu'
import type { H3Event } from 'h3'

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

export function useSanity(event?: H3Event, client?: string): SanityHelper
/** @deprecated prefer useSanity(event, client) */
export function useSanity(client?: string): SanityHelper
export function useSanity(_event?: H3Event | string, _client?: string): SanityHelper {
  const client = (typeof _event === 'string' ? _event : _client) || 'default'
  if (client in clients) {
    return clients[client]
  }

  const $config = useRuntimeConfig(typeof _event === 'string' ? undefined : _event)

  const sanityConfig = import.meta.client ? $config.public.sanity : defu($config.sanity, $config.public.sanity)
  const {
    additionalClients = {},
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
