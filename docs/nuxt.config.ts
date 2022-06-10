import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./node_modules/@docus/docs-theme'],
  github: {
    owner: 'nuxt-community',
    repo: 'sanity-module',
    branch: 'main',
  },
  theme: {},
  modules: ['@nuxthq/admin', '@docus/github', 'vue-plausible'],
  plausible: {
    url: 'sanity.nuxtjs.org',
  },
  tailwindcss: {
    config: {
      important: true,
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#FFF3F3',
              100: '#FFE8E6',
              200: '#FEC5C1',
              300: '#FDA29C',
              400: '#FC5C51',
              500: '#FA1607',
              600: '#E11406',
              700: '#960D04',
              800: '#710A03',
              900: '#4B0702',
            },
          },
        },
      },
    },
  },
  colorMode: {
    preference: 'dark',
  },
})
