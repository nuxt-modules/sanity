import { enableVisualEditing } from '@sanity/visual-editing'
import type { VisualEditingProps } from '../../types'

export function useSanityVisualEditing(options: VisualEditingProps = {}) {
  const config = useSanityConfig()
  if (!config.visualEditing) {
    throw new Error('Configure the `sanity.visualEditing` property in your `nuxt.config.ts` to use the `useSanityVisualEditing` composable. ')
  }

  const { zIndex, refresh } = options

  let disable = () => {}

  if (import.meta.client) {
    const router = useRouter()
    disable = enableVisualEditing({
      zIndex,
      // It is unlikely this API will be used as much by Nuxt users, as
      // implementing fully fledged visual editing is more straightforward
      // compared with other frameworks
      refresh: (payload) => {
        function refreshDefault() {
          if (payload.source === 'mutation' && payload.livePreviewEnabled) {
            // If live mode is enabled, the loader should handle updates via
            // `useQuery`, so we can ignore it here
            return false
          }
          return new Promise<void>((resolve) => {
            // Nuxt’s data fetching happens on both client and server, therefore
            // the default refresh mechanism is necessarily more of a brute
            // force solution. It would be preferable to use something like
            // `refreshNuxtData` here if we could use it to trigger a refetch of
            // data using the server Sanity client instance
            reloadNuxtApp({ ttl: 1000 })
            resolve()
          })
        }
        return refresh ? refresh(payload, refreshDefault) : refreshDefault()
      },
      history: {
        subscribe: (navigate) => {
          router.isReady().then(() => {
            navigate({
              type: 'replace',
              url: router.currentRoute.value.fullPath,
            })
          })
          return router.afterEach((to) => {
            // There is no mechanism to determine navigation type in a Vue
            // Router navigation guard, so just push
            // https://github.com/vuejs/vue-router/issues/1620
            navigate({ type: 'push', url: to.fullPath })
          })
        },
        update: (update) => {
          if (update.type === 'push' || update.type === 'replace') {
            router[update.type](update.url)
          }
          else if (update.type === 'pop') {
            router.back()
          }
        },
      },
    })
  }

  onScopeDispose(disable)

  return disable
}
