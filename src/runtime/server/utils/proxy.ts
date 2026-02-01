import { createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { extname } from 'pathe'
import picomatch from 'picomatch'
import { queriesFilePath } from '#sanity-groq-queries-info'
import type { SanityDevGlobals, SanityGroqQueryArray } from '../../types'
import { normalizeQuery } from '../../util/normalizeQuery'

const hasGroqQueries = (g: typeof globalThis): g is SanityDevGlobals => '__nuxt_sanity_groqQueries' in g

/**
 * Retrieves the GROQ queries from the file system.
 * Used in development where queries can change and need to be synchronized across processes.
 * Falls back to `globalThis` if the file is not yet written.
 *
 * @internal
 */
export async function getGroqQueriesFromFileSystem(): Promise<SanityGroqQueryArray> {
  try {
    const raw = await readFile(queriesFilePath, 'utf8')
    return JSON.parse(raw)
  }
  catch (err) {
    console.debug('Failed to read GROQ queries file, falling back to globalThis:', err)
  }

  const g = globalThis
  return hasGroqQueries(g) && Array.isArray(g.__nuxt_sanity_groqQueries) ? g.__nuxt_sanity_groqQueries : []
}

/**
 * Retrieves the GROQ queries from the virtual module.
 * Used in production for better performance (avoids runtime file I/O) since queries are static after build.
 *
 * @internal
 */
export async function getGroqQueriesFromModule(): Promise<SanityGroqQueryArray> {
  try {
    const { queryArr } = await import('#sanity-groq-queries')
    return Array.isArray(queryArr) ? queryArr : []
  }
  catch (err) {
    console.warn('Failed to load GROQ queries:', err)
  }

  return []
}

/**
 * Retrieves the GROQ queries detected in the codebase.
 *
 * @internal
 */
export const getGroqQueries = import.meta.dev
  ? getGroqQueriesFromFileSystem
  : getGroqQueriesFromModule

const normalizeExt = (e: string) => (e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`)

const isMatch = (filepath: string, patterns: string[]): boolean => {
  const matcher = picomatch(patterns)
  return matcher(filepath)
}

const DEFAULT_EXTENSIONS = ['vue', 'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'jsx', 'tsx']
const DEFAULT_EXCLUDE = ['**/*.test.*', 'tests/**']

export interface ValidateQueryOptions {
  /**
   * Useful for detecting why a validation failed
   * @defaultValue false
   */
  debug?: boolean
  /**
   * Filters the files that contain GROQ queries to validate against
   */
  filter?: {
    /**
     * File extensions to include in validation
     * @defaultValue {@link DEFAULT_EXTENSIONS}
     */
    extensions?: string[]
    /**
     * Glob patterns to include files in validation
     */
    include?: string[]
    /**
     * Glob patterns to exclude files from validation
     * @defaultValue {@link DEFAULT_EXCLUDE}
     */
    exclude?: string[]
  }
  /**
   * Throw an error if the query is not found/invalid
   * @defaultValue true
   */
  throwError?: boolean
}

/**
 * Filters queries based on file patterns and returns query strings.
 * Note: Queries are already normalized during extraction at build time.
 *
 * @param queries All available GROQ queries from the codebase (pre-normalized)
 * @param options Filter options (extensions, include, exclude, debug)
 * @returns Array of query strings after filtering
 */
export function filterQueries(
  queries: SanityGroqQueryArray,
  options: Pick<ValidateQueryOptions, 'filter' | 'debug'> = {},
): string[] {
  const { debug = false, filter } = options

  const exts = filter?.extensions?.map(normalizeExt) || DEFAULT_EXTENSIONS.map(normalizeExt)
  const include = filter?.include
  const exclude = filter?.exclude || DEFAULT_EXCLUDE

  return queries
    .filter(({ filepath }) => {
      if (exts?.length) {
        const ext = normalizeExt(extname(filepath))
        if (!exts.includes(ext)) {
          if (debug) console.info('Excluded by extension:', filepath)
          return false
        }
      }
      if (include?.length && !isMatch(filepath, include)) {
        if (debug) console.info('Excluded by include:', filepath)
        return false
      }
      if (exclude?.length && isMatch(filepath, exclude)) {
        if (debug) console.info('Excluded by exclude:', filepath)
        return false
      }
      return true
    })
    .flatMap(q => q.queries)
}

/**
 * Validates a GROQ query against a provided list of queries.
 *
 * @param queries All available GROQ queries from the codebase
 * @param query The GROQ query to validate
 * @param options Options for the validation process
 * @returns `true` if the query is valid, otherwise `false`
 */
export function validateQuery(
  queries: SanityGroqQueryArray,
  query: string,
  options: Omit<ValidateQueryOptions, 'throwError'> = {},
): boolean {
  const { debug = false } = options
  const filteredQueries = filterQueries(queries, options)
  const normalizedQuery = normalizeQuery(query)

  if (!filteredQueries.includes(normalizedQuery)) {
    if (debug) console.info(`The provided query was not found:\n${query}`)
    return false
  }

  return true
}

/**
 * Validates a GROQ query against the queries detected in the codebase.
 *
 * @param query The GROQ query to validate.
 * @param options Options for the validation process.
 * @returns `true` if the query is valid, otherwise throws an error or returns `false` based on the options.
 */
export async function validateSanityQuery(query: string, options: ValidateQueryOptions = {}): Promise<boolean> {
  const { throwError, ...rest } = options
  const queries = await getGroqQueries()

  const result = validateQuery(queries, query, rest)

  if (result === false && options.throwError !== false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The provided query is not allowed',
      data: { query },
    })
  }

  return result
}
