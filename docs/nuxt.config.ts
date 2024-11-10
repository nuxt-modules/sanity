export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible'],
  colorMode: {
    preference: 'dark',
  },
  compatibilityDate: '2024-08-19',
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
})
