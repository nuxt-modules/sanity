import { getQuery, createClient } from '../../src/client'

describe('minimal sanity client', () => {
  const mockFetch = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve([1, 2]) }),
    )

  beforeEach(() => {
    global.fetch = mockFetch
  })

  afterEach(() => {
    ;(global.fetch as any).mockClear()
    delete (global as any).fetch
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
    client.fetch(require('./fixture/large-request.json').request)

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
    expect(newClient === client).toBeFalsy()
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
