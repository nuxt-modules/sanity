import { setupTest } from '@nuxtjs/module-test-utils'

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
      sanity: {},
    },
  })
  test('should fail gracefully', () => {
    expect(mockWarn).toBeCalledWith(
      expect.stringContaining('Make sure you specify'),
    )
  })
})
