import type { SanityHelper, SanityPublicRuntimeConfig, SanityRuntimeConfig } from './src/types'

type nullish = null | undefined

declare module '#app' {
  interface NuxtApp {
    _sanity?: Record<string, SanityHelper>
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    sanity: SanityRuntimeConfig
  }

  interface PublicRuntimeConfig {
    sanity: SanityPublicRuntimeConfig
  }
}

export {}
