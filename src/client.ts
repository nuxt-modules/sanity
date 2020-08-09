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

export function getQs (query: string, params: Record<string, any> = {}) {
  const baseQs = `?query=${enc(query)}`
  return Object.keys(params).reduce((current, param) => {
    return `${current}&${enc(`$${param}`)}=${enc(
      JSON.stringify(params[param]),
    )}`
  }, baseQs)
}

export function createClient (config: SanityConfiguration) {
  const { projectId, dataset, useCdn, withCredentials, token } = config
  return {
    clone: () =>
      createClient({ projectId, dataset, useCdn, withCredentials, token }),
    /**
     * Perform a fetch using GROQ syntax.
     */
    async fetch<T = unknown> (query: string, params?: Record<string, any>) {
      const host = useCdn ? cdnHost : apiHost
      const qs = getQs(query, params)
      const response = await fetch(
        `https://${projectId}.${host}/v1/data/query/${dataset}${qs}`,
        {
          credentials: withCredentials ? 'include' : 'omit',
          headers: {
            ...(token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {}),
            Accept: 'application/json',
            ...(process.server ? { 'accept-encoding': 'gzip, deflate' } : {}),
          },
        },
      )
      const { result } = await response.json()
      return result as T
    },
  }
}
