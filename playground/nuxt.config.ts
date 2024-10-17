export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity'],
  app: {
    head: {
      script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
    },
  },
  compatibilityDate: '2024-08-19',
  sanity: {
    globalHelper: true,
    apiVersion: '2021-03-25',
    additionalClients: {
      another: {},
    },
    visualEditing: {
      token: process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN,
      studioUrl: 'http://localhost:3333',
    },
  },
})
