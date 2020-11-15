/**
 * Adapted from https://github.com/rexxars/picosanity
 */

const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

export interface SanityConfiguration {
  useCdn?: boolean
  projectId: string
  dataset?: string
  withCredentials?: boolean
  token?: string
}

const enc = encodeURIComponent

export function getQuery (query: string, params: Record<string, any> = {}) {
  const baseQs = `?query=${enc(query)}`
  return Object.keys(params).reduce((current, param) => {
    return `${current}&${enc(`$${param}`)}=${enc(
      JSON.stringify(params[param]),
    )}`
  }, baseQs)
}

export const getByteSize = (query: string) => encodeURI(query).split(/%..|./).length

export function createClient (config: SanityConfiguration) {
  const { projectId, dataset, useCdn, withCredentials, token } = config
  const fetchOptions: RequestInit = {
    credentials: withCredentials ? 'include' : 'omit',
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      Accept: 'application/json',
      ...(process.server
        ? { 'accept-encoding': 'gzip, deflate' }
        : {}),
    },
  }

  return {
    clone: () =>
      createClient({ projectId, dataset, useCdn, withCredentials, token }),
    /**
     * Perform a fetch using GROQ syntax.
     */
    async fetch<T = unknown> (query: string, params?: Record<string, any>) {
      const qs = getQuery(query, params)
      const usePostRequest = getByteSize(qs) > 9000

      const host = useCdn && !usePostRequest ? cdnHost : apiHost

      const response = usePostRequest
        ? await fetch(`https://${projectId}.${host}/v1/data/query/${dataset}`, {
            method: 'post',
            body: JSON.stringify({ query, params }),
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'Content-Type': 'application/json',
            },
          })
        : await fetch(
          `https://${projectId}.${host}/v1/data/query/${dataset}${qs}`,
          fetchOptions,
        )
      const { result } = await response.json()
      return result as T
    },
  }
}
