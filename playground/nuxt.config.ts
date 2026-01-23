const viewerToken = process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN

export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity', '@nuxt/image'],
  app: {
    head: {
      script: [{ src: 'https://unpkg.com/tailwindcss-jit-cdn' }],
    },
  },
  compatibilityDate: '2024-08-19',
  image: {
    sanity: {
      projectId: 'j1o4tmjp',
      dataset: 'production',
    },
  },
  sanity: {
    globalHelper: true,
    apiVersion: '2021-03-26',
    typegen: {
      enabled: true,
      schemaTypesPath: './cms/schemaTypes',
    },
    additionalClients: {
      another: {},
    },
    visualEditing: {
      token: viewerToken,
      studioUrl: 'http://localhost:3333',
    },
    liveContent: {
      browserToken: viewerToken,
      serverToken: viewerToken,
    },
  },
})
