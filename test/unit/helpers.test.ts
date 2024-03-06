import { expect, describe, it } from 'vitest'
import { getByteSize } from '../../src/runtime/minimal-client'

const behaviour = async () => {
  const variable = 'description'
  const { groq } = await import('../../src/runtime/groq')
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
  it('converts tagged literal into string with polyfill', async () => {
    const raw = String.raw
    delete (String as any).raw
    await behaviour()
    String.raw = raw
  })
})

describe('byte size', () => {
  it('calculates byte size', () => {
    expect(
      getByteSize('0123456789 0123456789 0123456789 0123456789'),
    ).toBeLessThan(50)
    expect(
      getByteSize('0123456789 0123456789 0123456789 0123456789'),
    ).toBeGreaterThan(40)
  })
})
