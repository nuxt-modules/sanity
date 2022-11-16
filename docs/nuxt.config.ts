export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  imports: {
    autoImport: true,
  },
  modules: ['nuxt-plausible'],
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
  colorMode: {
    preference: 'dark',
  },
})
