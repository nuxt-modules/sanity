// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/scripts'],
  scripts: {
    registry:
      {
        plausibleAnalytics: {
          domain: 'sanity.nuxtjs.org',
        },
      },
  },
})
