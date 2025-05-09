import type { SanityLiveStore, SanityLiveStoreSubscriberCallback, SanityResolvedConfig } from '../../types'

export const createLiveStore = (liveContent: SanityResolvedConfig['liveContent']): SanityLiveStore | undefined => {
  if (!liveContent) return undefined

  const entries = new Map<string, {
    lastLiveEventId: string | undefined
    callback: SanityLiveStoreSubscriberCallback
  }>()

  return {
    notify(tags, lastLiveEventId) {
      entries.forEach((entry) => {
        const updateLastLiveEventId = () => {
          entry.lastLiveEventId = lastLiveEventId
        }
        entry.callback(tags, updateLastLiveEventId)
      })
    },
    subscribe(queryKey, callback) {
      entries.set(queryKey, {
        lastLiveEventId: undefined,
        callback,
      })
      return {
        getLastLiveEventId: () => entries.get(queryKey)?.lastLiveEventId,
        unsubscribe: () => {
          entries.delete(queryKey)
        },
      }
    },
  }
}
