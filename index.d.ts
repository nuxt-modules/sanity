import type { ClientPerspective, StegaConfig } from '@sanity/client'
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
            draftMode:
              | false
              | {
                  enable: string
                  disable: string
                }
            mode: 'global' | 'component'
            studioUrl: string
            draftModeId: string
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
            draftMode:
              | false
              | {
                  enable: string
                  disable: string
                }
            mode: 'global' | 'component'
            studioUrl: string
          }
        | nullish
    }
    withCredentials: boolean
  }
}

export {}
