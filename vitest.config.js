import { defineVitestConfig } from 'nuxt-vitest/config'

export default defineVitestConfig({
  test: {
    coverage: { reporter: ['text'] },
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        overrides: {
          modules: ['@nuxtjs/sanity'],
          runtimeConfig: {
            sanity: {
              token: 'test',
            },
            public: {
              sanity: {
                projectId: 'test-project',
              },
            },
          },
        },
      },
    },
  },
})
