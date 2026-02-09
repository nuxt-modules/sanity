import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: { reporter: ['text'] },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
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
                modules: ['@nuxtjs/sanity', '@nuxt/image'],
                image: {
                  sanity: {
                    projectId: 'test-project',
                  },
                },
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
      await defineVitestProject({
        test: {
          name: 'nuxt-no-image',
          include: ['test/nuxt-no-image/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              overrides: {
                modules: ['@nuxtjs/sanity'],
                image: false,
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
