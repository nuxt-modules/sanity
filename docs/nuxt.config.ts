// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxt/scripts'],
  site: {
    name: 'Nuxt Sanity',
  },
  routeRules: {
    '/getting-started/quick-start': { redirect: '/getting-started/installation' },
    '/getting-started/query-optimization': { redirect: '/advanced/query-optimization' },
    '/getting-started/caching': { redirect: '/advanced/caching' },
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
