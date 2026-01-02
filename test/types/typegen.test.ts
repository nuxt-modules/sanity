/* @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'pathe'

import { extractSchemaFromTypesFile } from '../../src/runtime/typegen/schema-extractor'
import { generateSanityTypes } from '../../src/runtime/typegen/type-generator'

describe('sanity typegen (programmatic)', () => {
  it('extracts schema from schema types module', async () => {
    const typesPath = resolve(process.cwd(), 'test/fixtures/schema-types.ts')

    const schema = await extractSchemaFromTypesFile({ typesPath })

    expect(Array.isArray(schema)).toBe(true)
    expect(schema.some((t: any) => t?.type === 'document' && t?.name === 'movie')).toBe(true)
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
})
