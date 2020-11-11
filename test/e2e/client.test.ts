import { setupTest, get } from '@nuxt/test-utils'

describe('module with minimal options', () => {
  const mockSanityClient = jest.fn()

  beforeAll(() => {
    jest.mock('@sanity/client', () => mockSanityClient)
  })

  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    server: true,
    config: {
      sanity: {
        projectId: 'sample-project',
        minimal: true,
        imageHelper: false,
      },
    },
  })

  it('should use minimal client', async () => {
    await get('/')
    expect(mockSanityClient).toHaveBeenCalledTimes(0)
  }, 50000)
})
