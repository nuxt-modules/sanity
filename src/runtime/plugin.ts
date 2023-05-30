import type { SanityHelper } from './composables'
import { defineNuxtPlugin, useSanity } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('sanity', useSanity())
})

interface PluginInjection {
  $sanity: SanityHelper
}

declare module '#app' {
  interface NuxtApp extends PluginInjection {}
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends PluginInjection {}
}

// @ts-expect-error vue 2 types
declare module 'vue/types/vue' {
  interface Vue extends PluginInjection {}
}
