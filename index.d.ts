import { SanityHelper } from './src/runtime/composables'

declare module '#app' {
  interface NuxtApp {
    _sanity?: Record<string, SanityHelper>
  }
}
