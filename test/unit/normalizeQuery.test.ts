import { describe, it, expect } from 'vitest'
import { normalizeQuery } from '../../src/runtime/util/normalizeQuery'

describe('normalizeQuery', () => {
  it('should trim leading and trailing whitespace', () => {
    const result = normalizeQuery('  *[_type == "post"]  ')
    expect(result).toBe('*[_type == "post"]')
  })

  it('should collapse multiple spaces to single space', () => {
    const result = normalizeQuery('*[_type   ==   "post"]')
    expect(result).toBe('*[_type == "post"]')
  })

  it('should replace newlines with single space', () => {
    const result = normalizeQuery('*[_type\n==\n"post"]')
    expect(result).toBe('*[_type == "post"]')
  })

  it('should replace tabs with single space', () => {
    const result = normalizeQuery('*[_type\t==\t"post"]')
    expect(result).toBe('*[_type == "post"]')
  })

  it('should handle mixed whitespace types', () => {
    const result = normalizeQuery('*[_type == "post"]{title,\t\tdescription}')
    expect(result).toBe('*[_type == "post"]{title, description}')
  })

  it('should normalize complex queries with multiple conditions', () => {
    const result = normalizeQuery(
      '*[_type   ==   "post"   &&   defined(slug.current)]  |  order(publishedAt desc)  [0...10]',
    )
    expect(result).toBe('*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...10]')
  })

  it('should handle queries with leading/trailing newlines', () => {
    const result = normalizeQuery('\n\n*[_type == "post"]\n\n')
    expect(result).toBe('*[_type == "post"]')
  })

  it('should collapse multiple consecutive whitespace characters', () => {
    const result = normalizeQuery('*[_type  \t\n  ==  \n\t  "post"]')
    expect(result).toBe('*[_type == "post"]')
  })
})
