import { defineNuxtPlugin } from '#app'
import type { SanityHelper } from './composables'
import { useSanity } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('sanity', useSanity())
})

interface PluginInjection {
  $sanity: SanityHelper
}

declare module '#app' {
  interface NuxtApp extends PluginInjection { }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginInjection { }
}

// @ts-ignore
declare module 'vue/types/vue' {
  interface Vue extends PluginInjection { }
}
