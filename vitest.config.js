import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: { reporter: ['text'] },
    projects: [
      {
        test: {
          name: 'e2e',
          include: ['test/{e2e,types}/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
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
      }),
    ],
  },
})
