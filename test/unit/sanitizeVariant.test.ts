import { describe, it, expect, vi, afterEach } from 'vitest'
import { sanitizeVariant } from '../../src/runtime/util/sanitizeVariant'

describe('sanitizeVariant', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a bare variant id', () => {
    expect(sanitizeVariant('Ab12cd34')).toBe('Ab12cd34')
  })

  it('trims whitespace', () => {
    expect(sanitizeVariant('  Ab12cd34  ')).toBe('Ab12cd34')
  })

  it('returns undefined for empty or missing values', () => {
    expect(sanitizeVariant(undefined)).toBeUndefined()
    expect(sanitizeVariant(null)).toBeUndefined()
    expect(sanitizeVariant('')).toBeUndefined()
    expect(sanitizeVariant('   ')).toBeUndefined()
  })

  it('rejects full variant document ids and other invalid values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(sanitizeVariant('_.variants.Ab12cd34')).toBeUndefined()
    expect(sanitizeVariant('Ab12,cd34')).toBeUndefined()
    expect(sanitizeVariant(123)).toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })
})
