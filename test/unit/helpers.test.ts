import { getByteSize } from '../../src/client'

const behaviour = () => {
  const variable = 'description'
  const { groq } = require('../../src/helpers')
  const result = groq`
    *[_type == 'article'] {
      title,
      ${variable}
    }
  `

  expect(result).toBe(`
    *[_type == 'article'] {
      title,
      description
    }
  `)
}

describe('groq', () => {
  it('converts tagged literal into string', behaviour)
})

describe('groq with polyfill', () => {
  const raw = String.raw
  beforeAll(() => {
    jest.resetModules()
    delete (String as any).raw
  })
  afterAll(() => {
    String.raw = raw
  })
  it('converts tagged literal into string with polyfill', behaviour)
})

describe('byte size', () => {
  it('calculates byte size', () => {
    expect(
      getByteSize('0123456789 0123456789 0123456789 0123456789')
    ).toBeLessThan(50)
    expect(
      getByteSize('0123456789 0123456789 0123456789 0123456789')
    ).toBeGreaterThan(40)
  })
})
