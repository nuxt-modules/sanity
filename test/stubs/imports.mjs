export const isVue2 = false
export { createClient as createSanityClient } from '../../src/runtime/client'
export const useNuxtApp = () => ({})
export const useRuntimeConfig = () => ({
  sanity: {
    token: 'test',
  },
  public: {
    sanity: {
      projectId: 'test-project',
    },
  },
})
