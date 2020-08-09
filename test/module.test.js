import { setupTest } from '@nuxtjs/module-test-utils'

describe('module with default options', () => {
  const ctx = setupTest({
    __dirname,
    fixture: '../example',
    config: {
      sanity: {
        projectId: 'j1o4tmjp'
      }
    }
  })
  test('should inject core plugin with correct options', () => {
    expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledTimes(2)

    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('plugin.js'),
      fileName: 'sanity/plugin.js',
      options: {
        client: true,
        sanityConfig: JSON.stringify({
          ...ctx.config.sanity,
          dataset: 'production'
        })
      }
    })

    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('sanity-image.js'),
      fileName: 'sanity/sanity-image.js',
      options: {
        ...ctx.config.sanity,
        dataset: 'production'
      }
    })
  })
})
