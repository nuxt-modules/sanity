/* @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { chmod, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'pathe'

import { extractSchemaFromTypesFile } from '../../src/runtime/typegen/schema-extractor'
import { generateSanityTypes } from '../../src/runtime/typegen/type-generator'

describe('sanity typegen (programmatic)', () => {
  it('extracts schema from schema types module', async () => {
    const typesPath = resolve(process.cwd(), 'test/fixtures/schema-types.ts')

    const schema = await extractSchemaFromTypesFile({ typesPath })

    expect(Array.isArray(schema)).toBe(true)
    expect(schema.some(t => t?.type === 'document' && t?.name === 'movie')).toBe(true)
  })

  it('generates type declarations for extracted queries', async () => {
    const typesPath = resolve(process.cwd(), 'test/fixtures/schema-types.ts')
    const schema = await extractSchemaFromTypesFile({ typesPath })

    const workDir = await mkdtemp(join(tmpdir(), 'nuxtjs-sanity-typegen-'))
    const queryFile = join(workDir, 'queries.ts')

    await writeFile(
      queryFile,
      `export const movieQuery = groq\`*[_type == "movie"][0]{title, _id}\`\n`,
      'utf8',
    )

    const { code, fileCount } = await generateSanityTypes({
      schema,
      queryPaths: queryFile,
      rootDir: workDir,
      overloadClientMethods: true,
    })

    expect(fileCount).toBe(1)
    expect(code).toContain('export type MovieQueryResult')
    expect(code).toContain('declare module "@sanity/client"')
    expect(code).toContain('*[_type == \\"movie\\"][0]{title, _id}')
  })

  it.runIf(process.platform !== 'win32' && process.getuid?.() !== 0)('generates types when the project path contains a dot-prefixed directory', async () => {
    const typesPath = resolve(process.cwd(), 'test/fixtures/schema-types.ts')
    const schema = await extractSchemaFromTypesFile({ typesPath })

    const workDir = await mkdtemp(join(tmpdir(), '.nuxtjs-sanity-typegen-'))
    const lockedDir = join(workDir, 'node_modules', 'locked')

    await mkdir(lockedDir, { recursive: true })
    await writeFile(
      join(workDir, 'queries.ts'),
      `export const movieQuery = groq\`*[_type == "movie"][0]{title, _id}\`\n`,
      'utf8',
    )

    try {
      await chmod(lockedDir, 0o000)

      const { code, fileCount } = await generateSanityTypes({
        schema,
        queryPaths: join(workDir, '**/*.{ts,tsx,js,jsx,mjs,cjs,vue,astro}'),
        rootDir: workDir,
      })

      expect(fileCount).toBe(1)
      expect(code).toContain('export type MovieQueryResult')
      expect(code).toContain('*[_type == \\"movie\\"][0]{title, _id}')
    }
    finally {
      await chmod(lockedDir, 0o755)
      await rm(workDir, { force: true, recursive: true })
    }
  })

  it('generates types for multiple valid queries without errors', async () => {
    const typesPath = resolve(process.cwd(), 'test/fixtures/schema-types.ts')
    const schema = await extractSchemaFromTypesFile({ typesPath })

    const workDir = await mkdtemp(join(tmpdir(), 'nuxtjs-sanity-typegen-'))
    const queryFile = join(workDir, 'queries.ts')

    // Multiple valid queries in a single file
    await writeFile(
      queryFile,
      `export const allMoviesQuery = groq\`*[_type == "movie"]{title}\`
export const singleMovieQuery = groq\`*[_type == "movie"][0]{title, _id}\`
export const movieCountQuery = groq\`count(*[_type == "movie"])\`
`,
      'utf8',
    )

    const { code, fileCount, errors, typeNames } = await generateSanityTypes({
      schema,
      queryPaths: queryFile,
      rootDir: workDir,
      overloadClientMethods: true,
    })

    expect(fileCount).toBe(1)
    expect(errors).toHaveLength(0)

    // All three queries should have generated types
    expect(typeNames).toContain('AllMoviesQueryResult')
    expect(typeNames).toContain('SingleMovieQueryResult')
    expect(typeNames).toContain('MovieCountQueryResult')

    // Verify the types are in the generated code
    expect(code).toContain('export type AllMoviesQueryResult')
    expect(code).toContain('export type SingleMovieQueryResult')
    expect(code).toContain('export type MovieCountQueryResult')
  })
})
