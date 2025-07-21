// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/scripts'],
  llms: {
    domain: 'sanity.nuxtjs.org',
  },
  scripts: {
    registry:
      {
        plausibleAnalytics: {
          domain: 'sanity.nuxtjs.org',
        },
      },
  },
})
