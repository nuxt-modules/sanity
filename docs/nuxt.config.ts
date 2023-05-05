export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  imports: {
    autoImport: true,
  },
  // TODO: remove after v3.5 release
  experimental: { inlineSSRStyles: false },
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'sanity.nuxtjs.org',
  },
  colorMode: {
    preference: 'dark',
  },
})
