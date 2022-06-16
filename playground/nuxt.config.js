import { defineNuxtConfig } from 'nuxt'
import sanityModule from '../src/module'

export default defineNuxtConfig({
  meta: {
    script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
  },
  modules: [sanityModule, '~/modules/dev'],
  sanity: {
    globalHelper: true,
    projectId: 'j1o4tmjp',
    dataset: 'production',
    additionalClients: {
      another: {},
    },
  },
})
