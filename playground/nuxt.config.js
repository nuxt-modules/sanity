export default defineNuxtConfig({
  app: {
    head: {
      script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
    },
  },
  // remove in v3 - https://github.com/nuxt/framework/pull/9050
  runtimeConfig: { public: {} },
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
