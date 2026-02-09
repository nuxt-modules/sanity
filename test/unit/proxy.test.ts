import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SanityGroqQueryArray } from '../../src/runtime/types'
import { validateQuery, filterQueries, getGroqQueriesFromFileSystem, getGroqQueriesFromModule } from '../../src/runtime/server/utils/proxy'

const mockVirtualModuleQueries: SanityGroqQueryArray = [
  { filepath: 'virtual/module.vue', queries: ['*[_type == "virtual"]'] },
]

// Mock virtual modules that are imported by the proxy utils
vi.mock('#sanity-groq-queries-info', () => ({
  queriesFilePath: '/mock/path/to/queries.json',
}))

vi.mock('#sanity-groq-queries', () => ({
  queryArr: mockVirtualModuleQueries,
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

// Mock h3 for error creation
vi.mock('h3', () => ({
  createError: ({ statusCode, statusMessage, data }: any) => ({
    statusCode,
    statusMessage,
    data,
  }),
}))

describe('proxy', () => {
  describe('filterQueries (query filtering logic)', () => {
    it('should return all queries when no filters applied', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]', '*[_type == "page"]'] },
        { filepath: 'components/Article.vue', queries: ['*[_type == "article"]'] },
      ]

      const result = filterQueries(mockQueries)

      expect(result).toHaveLength(3)
      expect(result).toContain('*[_type == "post"]')
      expect(result).toContain('*[_type == "page"]')
      expect(result).toContain('*[_type == "article"]')
    })

    it('should filter by file extension', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
        { filepath: 'pages/index.ts', queries: ['*[_type == "article"]'] },
        { filepath: 'pages/blog.vue', queries: ['*[_type == "blog"]'] },
      ]

      const result = filterQueries(mockQueries, {
        filter: { extensions: ['vue'] },
      })

      expect(result).toHaveLength(2)
      expect(result).toContain('*[_type == "post"]')
      expect(result).toContain('*[_type == "blog"]')
      expect(result).not.toContain('*[_type == "article"]')
    })

    it('should filter by include pattern', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
        { filepath: 'components/Article.vue', queries: ['*[_type == "article"]'] },
        { filepath: 'pages/blog.vue', queries: ['*[_type == "blog"]'] },
      ]

      const result = filterQueries(mockQueries, {
        filter: { include: ['pages/**'] },
      })

      expect(result).toHaveLength(2)
      expect(result).toContain('*[_type == "post"]')
      expect(result).toContain('*[_type == "blog"]')
      expect(result).not.toContain('*[_type == "article"]')
    })

    it('should filter by exclude pattern', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
        { filepath: 'pages/test.test.vue', queries: ['*[_type == "test"]'] },
        { filepath: 'pages/blog.vue', queries: ['*[_type == "blog"]'] },
      ]

      const result = filterQueries(mockQueries, {
        filter: { exclude: ['**/*.test.*'] },
      })

      expect(result).toHaveLength(2)
      expect(result).toContain('*[_type == "post"]')
      expect(result).toContain('*[_type == "blog"]')
      expect(result).not.toContain('*[_type == "test"]')
    })

    it('should apply default exclude patterns', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
        { filepath: 'pages/test.test.vue', queries: ['*[_type == "test"]'] },
        { filepath: 'tests/helpers.vue', queries: ['*[_type == "helper"]'] },
      ]

      const result = filterQueries(mockQueries)

      expect(result).toHaveLength(1)
      expect(result).toContain('*[_type == "post"]')
      expect(result).not.toContain('*[_type == "test"]')
      expect(result).not.toContain('*[_type == "helper"]')
    })

    it('should combine multiple filters', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
        { filepath: 'pages/blog.vue', queries: ['*[_type == "blog"]'] },
        { filepath: 'pages/test.test.vue', queries: ['*[_type == "test"]'] },
        { filepath: 'components/Header.tsx', queries: ['*[_type == "nav"]'] },
        { filepath: 'components/Footer.vue', queries: ['*[_type == "footer"]'] },
      ]

      const result = filterQueries(mockQueries, {
        filter: {
          extensions: ['vue'],
          include: ['pages/**'],
          exclude: ['**/*.test.*'],
        },
      })

      expect(result).toHaveLength(2)
      expect(result).toContain('*[_type == "post"]')
      expect(result).toContain('*[_type == "blog"]')
      expect(result).not.toContain('*[_type == "test"]')
      expect(result).not.toContain('*[_type == "nav"]')
      expect(result).not.toContain('*[_type == "footer"]')
    })

    it('should flatten queries from multiple files', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.vue', queries: ['*[_type == "post"]', '*[_type == "page"]'] },
        { filepath: 'pages/blog.vue', queries: ['*[_type == "blog"]'] },
      ]

      const result = filterQueries(mockQueries)

      expect(result).toHaveLength(3)
    })

    it('should return empty array when all queries filtered out', () => {
      const mockQueries: SanityGroqQueryArray = [
        { filepath: 'pages/index.ts', queries: ['*[_type == "post"]'] },
      ]

      const result = filterQueries(mockQueries, {
        filter: { extensions: ['vue'] },
      })

      expect(result).toHaveLength(0)
    })

    it('should return empty array when queries array is empty', () => {
      const result = filterQueries([])

      expect(result).toHaveLength(0)
    })
  })

  describe('validateQuery (query validation logic)', () => {
    const simpleMockQueries: SanityGroqQueryArray = [
      { filepath: 'pages/index.vue', queries: ['*[_type == "post"]'] },
    ]

    it('should return true when query exists', () => {
      const result = validateQuery(simpleMockQueries, '*[_type == "post"]')
      expect(result).toBe(true)
    })

    it('should return false when query does not exist', () => {
      const result = validateQuery(simpleMockQueries, '*[_type == "article"]')
      expect(result).toBe(false)
    })

    it('should apply normalization to input query', () => {
      const result = validateQuery(simpleMockQueries, '*[_type   ==   "post"]')
      expect(result).toBe(true)
    })

    it('should return false when query list is empty', () => {
      const result = validateQuery([], '*[_type == "post"]')
      expect(result).toBe(false)
    })

    it('should log debug information when debug is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      validateQuery(simpleMockQueries, '*[_type == "article"]', { debug: true })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getGroqQueries (query source selection)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should read from virtual module', async () => {
      const result = await getGroqQueriesFromModule()

      expect(result).toEqual(mockVirtualModuleQueries)
    })

    it('should read from file system', async () => {
      const mockFileQueries: SanityGroqQueryArray = [{ filepath: 'from/file.vue', queries: ['*[_type == "file"]'] }]
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockFileQueries))

      const result = await getGroqQueriesFromFileSystem()

      expect(result).toEqual(mockFileQueries)
    })

    it('should call readFile with correct path when reading from file system', async () => {
      const mockFileQueries: SanityGroqQueryArray = [{ filepath: 'from/file.vue', queries: ['*[_type == "file"]'] }]
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockFileQueries))

      await getGroqQueriesFromFileSystem()

      expect(readFile).toHaveBeenCalledWith('/mock/path/to/queries.json', 'utf8')
    })

    it('should return empty array when file read fails', async () => {
      const { readFile } = await import('node:fs/promises')
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'))

      const result = await getGroqQueriesFromFileSystem()

      expect(result).toEqual([])
    })
  })
})
