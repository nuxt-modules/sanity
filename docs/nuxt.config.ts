export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  build: {
    transpile: [/-edge/, /@nuxt-themes/],
  },
  runtimeConfig: {
    public: {},
  },
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
