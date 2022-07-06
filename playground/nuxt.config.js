import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  meta: {
    script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
  },
  modules: ['@nuxtjs/sanity'],
  sanity: {
    globalHelper: true,
    projectId: 'j1o4tmjp',
    dataset: 'production',
    additionalClients: {
      another: {},
    },
  },
})
