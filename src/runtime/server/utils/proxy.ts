import { createError } from 'h3'
import { readFile } from 'node:fs/promises'
import { extname } from 'pathe'
import picomatch from 'picomatch'
import { queriesFilePath } from '#sanity-groq-queries-info'
import type { SanityDevGlobals, SanityGroqQueryArray } from '../../types'

const hasGroqQueries = (g: typeof globalThis): g is SanityDevGlobals => '__groqQueries' in g

/**
 * Retrieves the GROQ queries detected in the codebase.
 *
 * - In development: Reads directly from the generated file for cross-process support,
 *   falling back to `globalThis` if the file is not yet written.
 * - In production: Reads from the virtual module baked by the Nitro plugin at build time
 *   to avoid runtime file I/O cost.
 */
export async function getGroqQueries(): Promise<SanityGroqQueryArray> {
  if (import.meta.dev) {
    try {
      const raw = await readFile(queriesFilePath, 'utf8')
      return JSON.parse(raw)
    }
    catch {
      // Ignore
    }

    const g = globalThis
    return hasGroqQueries(g) && Array.isArray(g.__groqQueries)
      ? g.__groqQueries
      : []
  }

  try {
    const { queryArr } = await import('#sanity-groq-queries')
    return Array.isArray(queryArr) ? queryArr : []
  }
  catch (err) {
    console.warn('Failed to load GROQ queries:', err)
  }

  return []
}

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
   * @defaultValue false
   */
  throwError?: boolean
}

/**
 * Validates a GROQ query against the queries detected in the codebase.
 *
 * @param query The GROQ query to validate.
 * @param options Options for the validation process.
 * @returns `true` if the query is valid, otherwise throws an error or returns `false` based on the options.
 */
export async function validateQuery(query: string, options: ValidateQueryOptions = {}): Promise<boolean> {
  const { debug = false, filter, throwError = true } = options

  const exts = filter?.extensions?.map(normalizeExt) || DEFAULT_EXTENSIONS
  const include = filter?.include
  const exclude = filter?.exclude || DEFAULT_EXCLUDE

  const queries = (await getGroqQueries())
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

  if (!queries.includes(query)) {
    if (debug) console.info(`The provided query was not found:\n${query}`)
    if (throwError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'The provided query is not allowed',
        data: { query },
      })
    }

    return false
  }

  return true
}
