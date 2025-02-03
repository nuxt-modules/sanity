import { useSanity } from './useSanity'

export function useSanityLiveMode(options?: { client?: string }) {
  const { client = 'default' } = options || {}

  let disable = () => {}

  if (import.meta.client) {
    const sanity = useSanity(client)
    if (sanity.queryStore) {
      disable = sanity.queryStore.enableLiveMode({
        client: sanity.client,
      })
    }
  }

  onScopeDispose(disable)

  return disable
}
