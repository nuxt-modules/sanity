import {
  setupTest,
  expectModuleToBeCalledWith,
  getNuxt,
  expectModuleNotToBeCalledWith,
} from '@nuxt/test-utils'

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
    expectModuleToBeCalledWith(
      'addPlugin',
      {
        src: expect.stringContaining(
          'plugin.js',
        ),
        fileName:
                                                                      'sanity/plugin.js',
        options: {
          client: true,
          additionalClients: JSON.stringify(
            {
              another: {},
            },
          ),
          components: {
            autoregister: false,
            contentHelper: true,
            imageHelper: true,
          },
          sanityConfig: JSON.stringify(
            {
              useCdn: false,
              projectId,
              dataset,
              withCredentials: false,
            },
          ),
        },
      },
    )

    // TODO: waiting for test-utils to remove the ts-ignore
    expectModuleToBeCalledWith(
      // @ts-ignore
      'addTemplate',
      expect.objectContaining(
        {
          src: expect.stringContaining(
            'sanity-image',
          ),
        },
      ),
    )
    expectModuleToBeCalledWith(
      // @ts-ignore
      'addTemplate',
      expect.objectContaining(
        {
          src: expect.stringContaining(
            'sanity-content',
          ),
        },
      ),
    )
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

describe('module without sanity client installed', () => {
  beforeAll(() => {
    jest.mock('@sanity/client', () => {
      throw new Error('no client')
    })
  })

  setupTest({
    testDir: __dirname,
    fixture: '../../example',
  })

  it('should default to minimal client', () => {
    const { options } = getNuxt()
    expect(options.sanity.minimal).toBeTruthy()
  })
})

describe('module with existing transpiles', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    config: {
      build: {
        transpile: ['imaginary-module'],
      },
    },
  })

  it('should add module to transpile array', () => {
    const { options } = getNuxt()
    expect(options.build.transpile!.some(obj => obj instanceof RegExp && obj.test('@nuxtjs/sanity'))).toBeTruthy()
  })
})

describe('module without helpers', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    config: {
      sanity: {
        contentHelper: false,
        imageHelper: false,
      },
    },
  })

  it('should not install components', () => {
    // TODO: waiting for test-utils to remove the ts-ignore
    expectModuleNotToBeCalledWith(
      // @ts-ignore
      'addTemplate',
      expect.objectContaining({
        src: expect.stringContaining('sanity-image'),
      }),
    )
    expectModuleNotToBeCalledWith(
      // @ts-ignore
      'addTemplate',
      expect.objectContaining({
        src: expect.stringContaining('sanity-content'),
      }),
    )
  })
})
