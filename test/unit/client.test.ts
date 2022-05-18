import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest'
import { getQuery, createClient } from '../../src/runtime/client'
import { request as largeRequest } from './fixture/large-request.json'

describe('minimal sanity client', () => {
  let mockFetch
  beforeEach(() => {
    mockFetch = vi.fn(() =>
      Promise.resolve([1, 2]),
    )
    // @ts-ignore
    global.$fetch = mockFetch
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('correctly encodes query variables', () => {
    const encoded = getQuery('*[_type == $type]', {
      type: 'article',
      extra: 'nothing',
    })

    const decoded = decodeURIComponent(encoded)

    expect(encoded).toBe(
      '?query=*%5B_type%20%3D%3D%20%24type%5D&%24type=%22article%22&%24extra=%22nothing%22',
    )
    // For clarity!
    expect(decoded).toBe(
      '?query=*[_type == $type]&$type="article"&$extra="nothing"',
    )
  })

  it('creates a client with the correct methods', () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
    })
    expect(Object.keys(client)).toEqual(['clone', 'fetch'])
  })

  it('sends a GET request for smaller queries', () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
    })
    client.fetch('*[_type == "article"')

    expect(mockFetch).toBeCalledWith(
      'https://sample-project.api.sanity.io/v1/data/query/undefined?query=*%5B_type%20%3D%3D%20%22article%22',
      expect.not.objectContaining({ method: 'post' }),
    )
  })

  it('sends a POST request for large queries', () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
    })
    client.fetch(largeRequest)

    expect(mockFetch).toBeCalledWith(
      'https://sample-project.api.sanity.io/v1/data/query/undefined',
      expect.objectContaining({ method: 'post' }),
    )
  })

  it('can clone the client', () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
    })
    const newClient = client.clone()
    expect(Object.keys(newClient)).toEqual(['clone', 'fetch'])
    expect(newClient).not.toEqual(client)
  })

  const project = 'sample-project'
  const defaultOptions = {
    credentials: 'omit',
    headers: { Accept: 'application/json' },
  }

  it('uses API host where appropriate', async () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
      useCdn: false,
    })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.api.sanity.io`),
      defaultOptions,
    )
  })

  it('uses CDN host where appropriate', async () => {
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
      useCdn: true,
    })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.apicdn.sanity.io`),
      defaultOptions,
    )
  })

  it('uses passes a authentication token and credentials', async () => {
    const token = 'myToken'
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
      token,
      withCredentials: true,
    })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.api.sanity.io`),
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
  })

  it('uses compression on server', async () => {
    // @ts-ignore
    process.server = true
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '1',
    })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.api.sanity.io`),
      {
        credentials: 'omit',
        headers: {
          'accept-encoding': 'gzip, deflate',
          Accept: 'application/json',
        },
      },
    )
  })

  it('uses versioned api', async () => {
    // @ts-ignore
    process.server = true
    const client = createClient({
      projectId: 'sample-project',
      apiVersion: '2021-03-25',
    })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.api.sanity.io/v2021-03-25`),
      {
        credentials: 'omit',
        headers: {
          'accept-encoding': 'gzip, deflate',
          Accept: 'application/json',
        },
      },
    )
  })
})
