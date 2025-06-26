import { $fetch } from 'ofetch'

/**
 * Adapted from https://github.com/rexxars/picosanity
 */

const apiHost = 'api.sanity.io'
const cdnHost = 'apicdn.sanity.io'

export type QueryParams = Record<string, unknown>

export type ContentSourceMap = unknown

export interface ClientConfig {
  useCdn?: boolean
  projectId: string
  dataset?: string
  apiVersion: string
  withCredentials?: boolean
  token?: string
  perspective?: 'raw' | 'published' | 'previewDrafts'
}

/** @deprecated Prefer `ClientConfig` instead - this will be removed in a future version. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SanityConfiguration extends ClientConfig {}

const enc = encodeURIComponent

export function getQuery(query: string, params: Record<string, unknown> = {}) {
  const baseQs = `?query=${enc(query)}`
  return Object.keys(params).reduce((current, param) => {
    return `${current}&${enc(`$${param}`)}=${enc(
      JSON.stringify(params[param]),
    )}`
  }, baseQs)
}

export const getByteSize = (query: string) =>
  encodeURI(query).split(/%..|./).length

export function createClient(config: ClientConfig) {
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
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
      ...(import.meta.server ? { 'accept-encoding': 'gzip, deflate' } : {}),
    },
  }

  if (import.meta.client) {
    fetchOptions.credentials = withCredentials ? 'include' : 'omit'
  }

  const clientConfig = {
    useCdn,
    projectId,
    dataset,
    apiVersion,
    withCredentials,
    token,
    perspective,
  }

  return {
    config: () => clientConfig,
    clone: () =>
      createClient(clientConfig),
    /**
     * Perform a fetch using GROQ syntax.
     */
    async fetch<T = unknown>(query: string, params?: Record<string, unknown>) {
      const qs = getQuery(query, params) + `&perspective=${perspective}`
      const usePostRequest = getByteSize(qs) > 9000

      const host = useCdn && !usePostRequest ? cdnHost : apiHost

      const urlBase = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}`

      const { result } = usePostRequest
        ? await $fetch<{ result: T }>(urlBase, {
            ...fetchOptions,
            method: 'post',
            body: { query, params },
            query: { perspective },
          })
        : await $fetch<{ result: T }>(`${urlBase}${qs}`, fetchOptions)
      return { result }
    },
  }
}
