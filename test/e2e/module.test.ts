import { setupTest } from '@nuxtjs/module-test-utils'

const projectId = 'j1o4tmjp'
const dataset = 'production'

describe('module with default options', () => {
  const ctx = setupTest({
    __dirname,
    fixture: '../../example',
    config: {
      sanity: {
        projectId,
      },
    },
  })
  test('should inject core plugin with correct options', () => {
    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('plugin.js'),
      fileName: 'sanity/plugin.js',
      options: {
        client: true,
        components: {
          imageHelper: true,
        },
        sanityConfig: JSON.stringify({
          useCdn: false,
          projectId,
          dataset,
          withCredentials: false,
        }),
      },
    })

    expect(ctx.nuxt.moduleContainer.addTemplate).toBeCalled()
  })
})
