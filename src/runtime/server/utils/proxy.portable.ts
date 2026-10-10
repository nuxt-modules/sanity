import { createError } from 'nuxt/server'
import { getGroqQueries, validateQuery } from './queries'
import type { ValidateQueryOptions } from './queries'

export * from './queries'

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
      status: 400,
      statusText: 'The provided query is not allowed',
      data: { query },
    })
  }

  return result
}
