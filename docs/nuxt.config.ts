export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
  colorMode: {
    preference: 'dark',
  },
})
