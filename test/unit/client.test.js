import { getQs, createClient } from '../../src/client'

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
    global.fetch.mockClear()
    delete global.fetch
  })

  it('correctly encodes query variables', () => {
    const encoded = getQs('*[_type == $type]', {
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
    const client = createClient({ projectId: 'sample-project' })
    expect(Object.keys(client)).toEqual(['clone', 'fetch'])
  })

  it('can clone the client', () => {
    const client = createClient({ projectId: 'sample-project' })
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
    const client = createClient({ projectId: 'sample-project', useCdn: false })
    await client.fetch('*[_type == "article"]')

    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(`https://${project}.api.sanity.io`),
      defaultOptions,
    )
  })

  it('uses CDN host where appropriate', async () => {
    const client = createClient({ projectId: 'sample-project', useCdn: true })
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
    const client = createClient({ projectId: 'sample-project' })
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
})
