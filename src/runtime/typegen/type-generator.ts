import {
  TypeGenerator,
  findQueriesInPath,
  getResolver,
  registerBabel,
} from '@sanity/codegen'

export interface GenerateSanityTypesOptions {
  schema: unknown
  queryPaths: string | string[]
  rootDir: string
  overloadClientMethods?: boolean
}

export interface GenerateSanityTypesResult {
  code: string
  fileCount: number
  errors: string[]
  typeNames: string[]
}

/**
 * Extract exported type names from the generated code
 */
function extractTypeNames(code: string): string[] {
  const matches = code.matchAll(/^export type (\w+)/gm)
  return Array.from(matches, m => m[1]).filter((name): name is string => typeof name === 'string')
}

export async function generateSanityTypes(
  options: GenerateSanityTypesOptions,
): Promise<GenerateSanityTypesResult> {
  registerBabel()

  const { files, queries } = findQueriesInPath({
    path: options.queryPaths,
    resolver: getResolver(options.rootDir),
  })

  const errors: string[] = []
  const wrappedQueries = (async function* () {
    for await (const mod of queries) {
      if (!mod.errors) return

      for (const error of mod.errors) {
        errors.push(error.message)
      }

      yield mod
    }
  })()

  const generator = new TypeGenerator()
  const result = await generator.generateTypes({
    schema: options.schema,
    queries: wrappedQueries,
    root: options.rootDir,
    overloadClientMethods: options.overloadClientMethods ?? true,
  })

  return {
    code: result.code,
    fileCount: files.length,
    errors,
    typeNames: extractTypeNames(result.code),
  }
}
