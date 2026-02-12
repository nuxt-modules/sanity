import { describe, it, expect } from 'vitest'
import { resolveFetchOptions } from '../../src/runtime/util/resolveFetchOptions'

describe('resolveFetchOptions', () => {
  it('returns expected defaults with no arguments', () => {
    expect(resolveFetchOptions({})).toEqual({
      filterResponse: false,
      returnQuery: true,
    })
  })

  describe('queryOptions', () => {
    it('spreads properties into the result', () => {
      const opts = resolveFetchOptions({ queryOptions: { tag: 'my-tag' } })
      expect(opts.tag).toBe('my-tag')
    })

    it('filterResponse is always false', () => {
      const opts = resolveFetchOptions({ queryOptions: { filterResponse: true } })
      expect(opts.filterResponse).toBe(false)
    })

    it('returnQuery is always true', () => {
      const opts = resolveFetchOptions({ queryOptions: { returnQuery: false } })
      expect(opts.returnQuery).toBe(true)
    })

    it('perspective takes priority over queryOptions.perspective', () => {
      const opts = resolveFetchOptions({
        perspective: 'drafts',
        queryOptions: { perspective: 'published' },
      })
      expect(opts.perspective).toBe('drafts')
    })

    it('queryOptions.resultSourceMap takes priority over visualEditingEnabled', () => {
      const opts = resolveFetchOptions({
        visualEditingEnabled: true,
        queryOptions: { resultSourceMap: false },
      })
      expect(opts.resultSourceMap).toBe(false)
    })

    it('lastLiveEventId takes priority over queryOptions.lastLiveEventId', () => {
      const opts = resolveFetchOptions({
        lastLiveEventId: 'event-123',
        queryOptions: { lastLiveEventId: 'event-456' },
      })
      expect(opts.lastLiveEventId).toBe('event-123')
    })

    it('useCdn takes priority over queryOptions.useCdn', () => {
      const opts = resolveFetchOptions({
        liveContentEnabled: true,
        perspective: 'published',
        queryOptions: { useCdn: false },
      })
      expect(opts.useCdn).toBe(false)
    })

    it('queryOptions.cacheMode is used even when it would otherwise be omitted', () => {
      const opts = resolveFetchOptions({
        liveContentEnabled: true,
        perspective: 'drafts',
        queryOptions: { cacheMode: 'noStale' },
      })
      expect(opts.cacheMode).toBe('noStale')
    })
  })

  describe('token resolution', () => {
    it('uses queryOptions.token when no config tokens are set', () => {
      const opts = resolveFetchOptions({ queryOptions: { token: 'user-token' } })
      expect(opts.token).toBe('user-token')
    })

    it('queryOptions.token takes priority over liveContent.serverToken', () => {
      const opts = resolveFetchOptions({
        queryOptions: { token: 'user-token' },
        runtimeConfig: { liveContent: { serverToken: 'live-token' } } as any,
      })
      expect(opts.token).toBe('user-token')
    })

    it('queryOptions.token takes priority over visualEditing.token', () => {
      const opts = resolveFetchOptions({
        queryOptions: { token: 'user-token' },
        runtimeConfig: { visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBe('user-token')
    })

    it('liveContent.serverToken takes priority over visualEditing.token', () => {
      const opts = resolveFetchOptions({
        perspective: 'drafts',
        visualEditingEnabled: true,
        runtimeConfig: { liveContent: { serverToken: 'live-token' }, visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBe('live-token')
    })

    it('uses liveContent.serverToken for non-published perspective without visual editing', () => {
      const opts = resolveFetchOptions({
        perspective: 'drafts',
        runtimeConfig: { liveContent: { serverToken: 'live-token' } } as any,
      })
      expect(opts.token).toBe('live-token')
    })

    it('uses visualEditing.token when visual editing is enabled and perspective is not published', () => {
      const opts = resolveFetchOptions({
        perspective: 'drafts',
        visualEditingEnabled: true,
        runtimeConfig: { visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBe('ve-token')
    })

    it('omits visualEditing.token when visual editing is not enabled', () => {
      const opts = resolveFetchOptions({
        perspective: 'drafts',
        runtimeConfig: { visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBeUndefined()
    })

    it('is omitted for published perspective even if runtimeConfig tokens exist', () => {
      const opts = resolveFetchOptions({
        perspective: 'published',
        visualEditingEnabled: true,
        runtimeConfig: { liveContent: { serverToken: 'live-token' }, visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBeUndefined()
    })

    it('is omitted for raw perspective even if runtimeConfig tokens exist', () => {
      const opts = resolveFetchOptions({
        perspective: 'raw',
        visualEditingEnabled: true,
        runtimeConfig: { liveContent: { serverToken: 'live-token' }, visualEditing: { token: 've-token' } } as any,
      })
      expect(opts.token).toBeUndefined()
    })

    it('is omitted when nothing is configured', () => {
      const opts = resolveFetchOptions({})
      expect(opts.token).toBeUndefined()
    })
  })

  describe('stega resolution', () => {
    it('uses explicit stega option', () => {
      const opts = resolveFetchOptions({ stega: true })
      expect(opts.stega).toBe(true)
    })

    it('explicit stega takes priority over client config', () => {
      const opts = resolveFetchOptions({
        stega: false,
        visualEditingEnabled: true,
        clientConfig: { stega: { enabled: true, studioUrl: 'https://studio.test' } } as any,
      })
      expect(opts.stega).toBe(false)
    })

    it('falls back to client config when stega is not set', () => {
      const opts = resolveFetchOptions({
        visualEditingEnabled: true,
        clientConfig: { stega: { enabled: true, studioUrl: 'https://studio.test' } } as any,
      })
      expect(opts.stega).toBe(true)
    })

    it('is omitted when nothing is configured', () => {
      const opts = resolveFetchOptions({})
      expect(opts.stega).toBeUndefined()
    })

    it('is omitted when client config stega has no studioUrl', () => {
      const opts = resolveFetchOptions({
        visualEditingEnabled: true,
        clientConfig: { stega: { enabled: true, studioUrl: undefined } } as any,
      })
      expect(opts.stega).toBeUndefined()
    })

    it('is omitted when visual editing is not enabled', () => {
      const opts = resolveFetchOptions({
        clientConfig: { stega: { enabled: true, studioUrl: 'https://studio.test' } } as any,
      })
      expect(opts.stega).toBeUndefined()
    })

    it('is omitted when client config stega is not enabled', () => {
      const opts = resolveFetchOptions({
        visualEditingEnabled: true,
        clientConfig: { stega: { enabled: false, studioUrl: 'https://studio.test' } } as any,
      })
      expect(opts.stega).toBeUndefined()
    })
  })

  describe('resultSourceMap', () => {
    it('is withKeyArraySelector when visual editing is enabled', () => {
      const opts = resolveFetchOptions({ visualEditingEnabled: true })
      expect(opts.resultSourceMap).toBe('withKeyArraySelector')
    })

    it('is omitted when visual editing is not enabled', () => {
      const opts = resolveFetchOptions({})
      expect(opts.resultSourceMap).toBeUndefined()
    })
  })

  describe('useCdn and cacheMode', () => {
    it('are omitted when liveContentEnabled is false', () => {
      const opts = resolveFetchOptions({ perspective: 'published' })
      expect(opts.useCdn).toBeUndefined()
      expect(opts.cacheMode).toBeUndefined()
    })

    it('useCdn is true and cacheMode is noStale for published perspective with LCAPI', () => {
      const opts = resolveFetchOptions({ liveContentEnabled: true, perspective: 'published' })
      expect(opts.useCdn).toBe(true)
      expect(opts.cacheMode).toBe('noStale')
    })

    it('useCdn is false and cacheMode is omitted for non-published perspective with LCAPI', () => {
      const opts = resolveFetchOptions({ liveContentEnabled: true, perspective: 'drafts' })
      expect(opts.useCdn).toBe(false)
      expect(opts.cacheMode).toBeUndefined()
    })
  })

  describe('integration', () => {
    it('resolves all options for a published LCAPI request with visual editing', () => {
      expect(resolveFetchOptions({
        clientConfig: { stega: { enabled: true, studioUrl: 'https://studio.test' } } as any,
        lastLiveEventId: 'event-1',
        liveContentEnabled: true,
        perspective: 'published',
        runtimeConfig: { liveContent: { serverToken: 'server-token' } } as any,
        visualEditingEnabled: true,
      })).toEqual({
        cacheMode: 'noStale',
        filterResponse: false,
        lastLiveEventId: 'event-1',
        perspective: 'published',
        resultSourceMap: 'withKeyArraySelector',
        returnQuery: true,
        stega: true,
        useCdn: true,
      })
    })

    it('resolves all options for a drafts LCAPI request with visual editing', () => {
      expect(resolveFetchOptions({
        lastLiveEventId: 'event-2',
        liveContentEnabled: true,
        perspective: 'drafts',
        runtimeConfig: { liveContent: { serverToken: 'server-token' } } as any,
        visualEditingEnabled: true,
      })).toEqual({
        filterResponse: false,
        lastLiveEventId: 'event-2',
        perspective: 'drafts',
        resultSourceMap: 'withKeyArraySelector',
        returnQuery: true,
        token: 'server-token',
        useCdn: false,
      })
    })

    it('resolves all options for a simple request without LCAPI or visual editing', () => {
      expect(resolveFetchOptions({
        perspective: 'published',
      })).toEqual({
        filterResponse: false,
        perspective: 'published',
        returnQuery: true,
      })
    })
  })
})
