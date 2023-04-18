export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  imports: {
    autoImport: true,
  },
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
  colorMode: {
    preference: 'dark',
  },
})
