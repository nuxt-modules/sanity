import { resolve } from 'path'
/**
 * @type {import('@nuxt/types').NuxtConfig} config
 */
const config = {
  alias: {
    '@nuxtjs/sanity/dist/components/sanity-content': resolve(__dirname, '../src/components/sanity-content'),
    '@nuxtjs/sanity/dist/components/sanity-image': resolve(__dirname, '../src/components/sanity-image'),
    '@nuxtjs/sanity': resolve(__dirname, '../src/index.ts'),
  },
  buildModules: [
    '@nuxt/typescript-build',
    ...(process.env.NODE_ENV === 'development' ? ['@nuxtjs/tailwindcss'] : []),
    '../src/module.ts',
  ],
  sanity: {
    ...(process.env.NODE_ENV === 'development'
      ? { projectId: 'j1o4tmjp' }
      : {}),
    dataset: 'production',
    additionalClients: {
      another: {},
    },
  },
}

export default config
