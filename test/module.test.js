import { setupTest } from '@nuxtjs/module-test-utils'

describe.skip('module with default options', () => {
  const ctx = setupTest({
    __dirname,
    fixture: '../example',
    config: {
      sanity: {
        projectId: 'sample-project-id'
      }
    }
  })
  test('should inject core plugin with correct options', () => {
    // expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledTimes(2)

    expect(ctx).toNuxtPluginAdded({
      src: expect.stringContaining('templates/plugin.js'),
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
      src: expect.stringContaining('templates/sanity-image.js'),
      fileName: 'sanity/sanity-image.js',
      options: {
        ...ctx.config.sanity,
        dataset: 'production'
      }
    })
  })
})

describe.skip('module without image helper', () => {
  const ctx = setupTest({
    __dirname,
    fixture: '../example',
    config: {
      sanity: {
        projectId: 'sample-project-id',
        imageHelper: false
      }
    }
  })
  test('should not inject image helper', () => {
    expect(ctx.nuxt.moduleContainer.addPlugin).toBeCalledTimes(1)
  })
})
