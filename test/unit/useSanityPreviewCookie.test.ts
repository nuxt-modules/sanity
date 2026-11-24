import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

import { useSanityPreviewCookie } from '../../src/runtime/composables/useSanityPreviewCookie'

const mocks = vi.hoisted(() => ({
  useCookie: vi.fn(),
  runtimeConfig: { value: {} as Record<string, any> },
}))

vi.mock('#imports', () => ({
  useCookie: mocks.useCookie,
  useRuntimeConfig: () => mocks.runtimeConfig.value,
}))

const publicSanity = (visualEditing?: Record<string, unknown>) => ({
  public: {
    sanity: {
      ...visualEditing ? { visualEditing } : {},
    },
  },
})

describe('useSanityPreviewCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the default preview cookie name when not configured', () => {
    mocks.runtimeConfig.value = publicSanity()
    mocks.useCookie.mockReturnValue(ref('preview-id'))

    const cookie = useSanityPreviewCookie()

    expect(mocks.useCookie).toHaveBeenCalledWith('sanity-preview-id')
    expect(cookie.value).toBe('preview-id')
  })

  it('uses the configured preview cookie name', () => {
    mocks.runtimeConfig.value = publicSanity({ previewCookieName: 'my-custom-preview-cookie' })
    mocks.useCookie.mockReturnValue(ref('preview-id'))

    const cookie = useSanityPreviewCookie()

    expect(mocks.useCookie).toHaveBeenCalledWith('my-custom-preview-cookie')
    expect(cookie.value).toBe('preview-id')
  })

  it('returns the cookie ref returned by useCookie', () => {
    mocks.runtimeConfig.value = publicSanity()
    const cookieRef = ref<string | null>(null)
    mocks.useCookie.mockReturnValue(cookieRef)

    const cookie = useSanityPreviewCookie()

    expect(cookie).toBe(cookieRef)
    cookieRef.value = 'preview-id'
    expect(cookie.value).toBe('preview-id')
  })
})
