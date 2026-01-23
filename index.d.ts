import type { DefineComponent } from 'vue'
import type { SanityHelper, SanityPublicRuntimeConfig, SanityRuntimeConfig } from './src/runtime/types'

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

declare module '#build/sanity-image.mjs' {
  const SanityImage: DefineComponent<{
    assetId: string
    projectId?: string | null
    dataset?: string | null
    auto?: string
    bg?: string
    blur?: number | string
    crop?: string
    dl?: string
    dpr?: number | string
    fit?: string
    flip?: string
    fm?: string
    fpX?: number | string
    fpY?: number | string
    h?: number | string
    invert?: boolean
    maxH?: number | string
    maxW?: number | string
    minH?: number | string
    minW?: number | string
    or?: number | string
    q?: number | string
    rect?: string
    sat?: number | string
    sharpen?: number | string
    w?: number | string
  }>
  export default SanityImage
}

export {}
