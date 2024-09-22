export default defineNuxtConfig({
  compatibilityDate: '2024-08-19',
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
  colorMode: {
    preference: 'dark',
  },
})
