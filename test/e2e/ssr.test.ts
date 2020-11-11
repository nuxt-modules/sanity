import { setupTest, get } from '@nuxt/test-utils'

const configs = {
  'default options': {
    sanity: {
      projectId: 'j1o4tmjp',
    },
  },
  'components support': {
    components: true,
    sanity: {
      projectId: 'j1o4tmjp',
    },
  },
  'minimal client': {
    sanity: {
      projectId: 'j1o4tmjp',
      minimal: true,
    },
  },
}

Object.entries(configs).forEach(([type, config]) =>
  describe(`module with ${type}`, () => {
    setupTest({
      testDir: __dirname,
      server: true,
      fixture: '../../example',
      config,
    })

    test('Sanity image builder works', async () => {
      const { body: html } = await get('/')
      expect(html).toContain(
        'https://cdn.sanity.io/images/j1o4tmjp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?auto=format&amp;w=128',
      )
    }, 50000)

    test('Sanity config is exposed', async () => {
      const { body: html } = await get('/')
      expect(html).toContain('Project ID: j1o4tmjp')
    }, 50000)

    test('CMS items are fetched', async () => {
      const { body: html } = await get('/')
      expect(html).toContain('Guardians of the Galaxy')
    }, 50000)

    test('Can view single film page', async () => {
      const { body: html } = await get('/movie/alien')
      expect(html).toContain('Arthur Dallas')
    }, 50000)
  }),
)
