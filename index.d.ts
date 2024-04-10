import type { ClientPerspective, StegaConfig } from '@sanity/client'
import type {
  SanityVisualEditingMode,
  SanityVisualEditingRefreshHandler,
  SanityVisualEditingZIndex,
} from './src/module'
import type { SanityHelper } from '#sanity-composables'

type nullish = null | undefined | void

declare module '#app' {
  interface NuxtApp {
    _sanity?: Record<string, SanityHelper>
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    sanity: {
      visualEditing:
        | {
          mode: SanityVisualEditingMode
          previewMode:
            | false
            | {
              enable: string
              disable: string
            }
          previewModeId: string
          proxyEndpoint: string
          studioUrl: string
          token: string
        }
        | undefined
    }
  }

  interface PublicRuntimeConfig {
    sanity: {
      additionalClients: Record<string, any>
      apiVersion: string
      dataset: string
      disableSmartCdn: boolean
      perspective: ClientPerspective
      projectId: string
      stega: StegaConfig
      token: string
      useCdn: boolean
      visualEditing:
        | {
          mode: SanityVisualEditingMode
          previewMode:
            | false
            | {
              enable: string
              disable: string
            }
          proxyEndpoint: string
          refresh: SanityVisualEditingRefreshHandler | undefined
          studioUrl: string
          zIndex: SanityVisualEditingZIndex
        }
        | nullish
    }
    withCredentials: boolean
  }
}

export {}
