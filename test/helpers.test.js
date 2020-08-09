import { groq } from '../src/helpers'

describe('groq', () => {
  it('converts tagged literal into string', () => {
    const variable = 'description'
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
  })
})
