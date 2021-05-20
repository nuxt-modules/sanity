import { withDocus } from 'docus'

export default withDocus({
  buildModules: ['vue-plausible'],
  ackee: {
    server: 'sanity.nuxtjs.org',
  },
})
