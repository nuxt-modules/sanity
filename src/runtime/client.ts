import { $fetch } from 'ofetch'

/**
 * Adapted from https://github.com/rexxars/picosanity
 */

const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

export type SanityClient = ReturnType<typeof createClient>

export interface SanityConfiguration {
  useCdn?: boolean
  projectId: string
  dataset?: string
  apiVersion: string
  withCredentials?: boolean
  token?: string
  perspective?: 'raw' | 'published' | 'previewDrafts'
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

export const getByteSize = (query: string) =>
  encodeURI(query).split(/%..|./).length

export function createClient (config: SanityConfiguration) {
  const {
    projectId,
    dataset,
    apiVersion = '1',
    withCredentials,
    token,
    perspective = 'raw',
  } = config

  const useCdn = perspective !== 'previewDrafts' && config.useCdn

  const fetchOptions: RequestInit = {
    credentials: withCredentials ? 'include' : 'omit',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
      ...(process.server ? { 'accept-encoding': 'gzip, deflate' } : {}),
    },
  }

  return {
    clone: () =>
      createClient({
        useCdn,
        projectId,
        dataset,
        apiVersion,
        withCredentials,
        token,
        perspective,
      }),
    /**
     * Perform a fetch using GROQ syntax.
     */
    async fetch<T = unknown> (query: string, params?: Record<string, any>) {
      const qs = getQuery(query, params)
      const usePostRequest = getByteSize(qs) > 9000

      const host = useCdn && !usePostRequest ? cdnHost : apiHost

      const urlBase = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}`

      const { result } = usePostRequest
        ? await $fetch<{ result: T }>(urlBase, {
          ...fetchOptions,
          method: 'post',
          body: { query, params, perspective },
        })
        : await $fetch<{ result: T }>(`${urlBase}${qs}`, fetchOptions)
      return result
    },
  }
}
