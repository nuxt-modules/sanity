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
    additionalClients: {
      another: {},
    },
  },
})
