import { useSanity } from './useSanity'

export function useSanityLiveMode(options?: { client?: string }) {
  const config = useSanityConfig()
  if (!config.visualEditing) {
    throw new Error('Configure the `sanity.visualEditing` property in your `nuxt.config.ts` to use the `useSanityLiveMode` composable. ')
  }

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
