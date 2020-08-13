import theme from '@nuxt/content-theme-docs'

export default theme({
  generate: {
    routes: ['/'],
  },
  buildModules: ['nuxt-ackee'],
  ackee: {
    server: 'https://ackee.nuxtjs.com',
    domainId: 'ce4748c0-4ca5-45b2-87d2-6fb06ea01b45',
    detailed: true,
  }
})
