import { setupTest, createPage } from '@nuxt/test-utils'

const configs = {
  base: {
    sanity: {
      projectId: 'j1o4tmjp',
    },
  },
  autoregistration: {
    components: true,
    sanity: {
      projectId: 'j1o4tmjp',
    },
  },
}

Object.entries(configs).forEach(([type, config]) =>
  describe(`module with ${type} options`, () => {
    setupTest({
      testDir: __dirname,
      browser: true,
      fixture: '../../example',
      config,
    })

    test('Sanity image builder works', async () => {
      const page = await createPage('/')
      const html = await page.innerHTML('body')
      expect(html).toContain(
        'https://cdn.sanity.io/images/j1o4tmjp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?auto=format&amp;w=128',
      )
    }, 50000)

    test('Sanity config is exposed', async () => {
      const page = await createPage('/')
      const html = await page.innerHTML('body')
      expect(html).toContain('Project ID: j1o4tmjp')
    }, 50000)

    test('CMS items are fetched', async () => {
      const page = await createPage('/')
      const html = await page.innerHTML('body')
      expect(html).toContain('Guardians of the Galaxy')
    }, 50000)

    test('Can view single film page', async () => {
      const page = await createPage('/movie/alien')
      const html = await page.innerHTML('body')
      expect(html).toContain('Arthur Dallas')
    }, 50000)
  }),
)
