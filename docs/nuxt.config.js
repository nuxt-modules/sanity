import { withDocus } from 'docus'

export default withDocus({
  loading: { color: '#fa1607' },
  generate: {
    routes: ['/'],
  },
  buildModules: ['vue-plausible'],
  ackee: {
    server: 'sanity.nuxtjs.org',
  },
})
