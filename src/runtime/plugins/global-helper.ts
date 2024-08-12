import type { SanityHelper } from '#sanity-composables'
import { defineNuxtPlugin, useSanity } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('sanity', useSanity())
})

interface PluginInjection {
  $sanity: SanityHelper
}

declare module '#app' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginInjection {}
}

declare module '@vue/runtime-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginInjection {}
}

// @ts-expect-error vue 2 types
declare module 'vue/types/vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Vue extends PluginInjection {}
}
