/* @vitest-environment node */
import { describe, expect, it, vi } from 'vitest'
import type { SchemaType } from 'groq-js'

import { generateSanityTypes } from '../../src/runtime/typegen/type-generator'

const { findQueriesInPath } = vi.hoisted(() => ({
  findQueriesInPath: vi.fn(),
}))

vi.mock('@sanity/codegen', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sanity/codegen')>()
  return {
    ...actual,
    findQueriesInPath,
    getResolver: () => () => null,
    registerBabel: () => {},
    TypeGenerator: class {
      async generateTypes() {
        return { code: 'export type Empty = never' }
      }
    },
  }
})

const schema = { name: 'test' } as unknown as SchemaType

describe('generateSanityTypes', () => {
  it('excludes node_modules with an absolute negative glob', async () => {
    findQueriesInPath.mockReturnValue({
      files: ['/project/src/queries.ts'],
      queries: (async function* () {})(),
    })

    const result = await generateSanityTypes({
      schema,
      queryPaths: '/project/src/**/*.{ts,tsx}',
      rootDir: '/project',
    })

    expect(findQueriesInPath).toHaveBeenCalledTimes(1)
    expect(findQueriesInPath).toHaveBeenCalledWith(expect.objectContaining({
      path: ['/project/src/**/*.{ts,tsx}', '!/project/**/node_modules/**'],
    }))
    expect(result.fileCount).toBe(1)
  })

  it('keeps the negative glob when multiple query paths are provided', async () => {
    findQueriesInPath.mockReturnValue({
      files: [],
      queries: (async function* () {})(),
    })

    await generateSanityTypes({
      schema,
      queryPaths: ['/project/src/**/*.ts', '/project/pages/**/*.vue'],
      rootDir: '/project',
    })

    expect(findQueriesInPath).toHaveBeenCalledWith(expect.objectContaining({
      path: ['/project/src/**/*.ts', '/project/pages/**/*.vue', '!/project/**/node_modules/**'],
    }))
  })
})
