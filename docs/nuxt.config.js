import { withDocus } from 'docus'

export default withDocus({
  rootDir: __dirname,
  buildModules: ['vue-plausible'],
  ackee: {
    server: 'sanity.nuxtjs.org',
  },
})
