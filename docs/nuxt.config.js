import theme from '@nuxt/content-theme-docs'

export default theme({
  loading: { color: '#fa1607' },
  generate: {
    routes: ['/'],
  },
  buildModules: ['vue-plausible'],
  ackee: {
    server: 'sanity.nuxtjs.org'
  },
})
