import { defineNuxtPlugin, Plugin } from '#app'
import type { SanityHelper } from './composables'
import { useSanity } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('sanity', useSanity())
}) as Plugin<{ sanity: SanityHelper }>
