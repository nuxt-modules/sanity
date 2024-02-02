export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
    },
  },
  modules: ['@nuxtjs/sanity'],
  sanity: {
    globalHelper: true,
    projectId: 'j1o4tmjp',
    dataset: 'production',
    apiVersion: '2021-03-25',
    additionalClients: {
      another: {},
    },
    visualEditing: {
      stega: true,
      draftMode: true,
      token: process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN,
      studioUrl: 'http://localhost:3333',
    },
  },
})
