// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/scripts'],
  site: {
    name: 'Nuxt Sanity',
  },
  nitro: {
    static: true,
  },
  llms: {
    domain: 'sanity.nuxtjs.org',
  },
  scripts: {
    registry: {
      plausibleAnalytics: {
        domain: 'sanity.nuxtjs.org',
      },
    },
  },
})
