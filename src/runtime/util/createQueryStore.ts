import { createQueryStore as createCoreQueryStore } from '@sanity/core-loader'
import type { SanityResolvedConfig } from '../../types'
import type { SanityClient } from '../client'

export const createQueryStore = (
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
