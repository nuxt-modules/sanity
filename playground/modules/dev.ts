import { defineNuxtModule } from '@nuxt/kit'

// This module is a POC for a possible module to assist other modules in developing
// Nuxt modules (or alternatively to build similar features into Nuxt or nuxt-module-builder).

export default defineNuxtModule({
  meta: {
    name: 'module-dev',
  },
  setup (_options, nuxt) {
    nuxt.options.typescript.typeCheck = true
  },
})
