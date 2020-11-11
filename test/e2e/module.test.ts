import { setupTest, expectModuleToBeCalledWith, getNuxt } from '@nuxt/test-utils'

const projectId = 'j1o4tmjp'
const dataset = 'production'

describe('module with default options', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    config: {
      sanity: {
        projectId,
      },
    },
  })
  it('should inject core plugin with correct defaults', () => {
    expectModuleToBeCalledWith('addPlugin', {
      src: expect.stringContaining('plugin.js'),
      fileName: 'sanity/plugin.js',
      options: {
        client: true,
        additionalClients: JSON.stringify({ another: {} }),
        components: {
          autoregister: false,
          contentHelper: true,
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
  }, 50000)
})

describe('module with sanity.json', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
  })
  test('should read defaults from JSON', () => {
    const { options } = getNuxt()
    expect(options.sanity.projectId).toEqual('default')
  }, 50000)
})

describe('module without a project id', () => {
  const mockWarn = jest.fn()

  jest.mock('consola', () => ({
    info: () => {},
    warn: mockWarn,
  }))

  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    config: {
      sanity: {
        projectId: '',
      },
    },
  })

  it('should fail gracefully', () => {
    expect(mockWarn).toBeCalledWith(
      expect.stringContaining('Make sure you specify'),
    )
  }, 50000)
})
