import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { createJiti } from 'jiti'
import { createRegExp, exactly } from 'magic-regexp'
import {
  addComponentsDir,
  addImports,
  addPlugin,
  addServerHandler,
  addServerImports,
  addServerTemplate,
  addTemplate,
  addTypeTemplate,
  addVitePlugin,
  defineNuxtModule,
  resolvePath,
  useLogger,
} from '@nuxt/kit'

import { colors } from 'consola/utils'
import { basename, join, relative, resolve, sep } from 'pathe'
import { defu } from 'defu'
import { genExport } from 'knitwork'

import { findQueriesInSource } from '@sanity/codegen'
import type { ClientConfig as SanityClientConfig, StegaConfig } from '@sanity/client'
import type { HistoryRefresh } from '@sanity/visual-editing'
import { name, version } from '../package.json'

import type { ClientConfig as MinimalClientConfig } from './runtime/minimal-client'
import type { SanityDevGlobals, SanityGroqQueryArray, SanityGroqQueryMap, SanityPublicRuntimeConfig, SanityRuntimeConfig, SanityVisualEditingZIndex } from './runtime/types'

export type SanityVisualEditingMode = 'live-visual-editing' | 'visual-editing' | 'custom'

export type SanityVisualEditingRefreshHandler = (
  payload: HistoryRefresh,
  refreshDefault: () => false | Promise<void>,
) => false | Promise<void>

export interface SanityModuleVisualEditingOptions {
  /**
   * Enable preview mode or configure preview endpoints
   */
  previewMode?:
    | boolean
    | {
      enable?: string
      disable?: string
    }
  /**
   * Enable visual editing at app level or per component
   * @default 'live-visual-editing'
   */
  mode?: SanityVisualEditingMode
  /**
   * Proxy endpoint for fetching preview data
   * @default '/_sanity/visual-editing/fetch'
   */
  proxyEndpoint?: string
  /**
   * Read token for server side queries
   * @required
   */
  token?: string
  /**
   * The URL of the Sanity Studio
   */
  studioUrl?: string
  /**
   * Enable stega
   * @default false
   */
  stega?: boolean
  /**
   * An optional function for overriding the default handling of refresh events
   * received from the studio. This is generally not need needed if the `mode`
   * option is set to `live-visual-editing`.
   */
  refresh?: SanityVisualEditingRefreshHandler
  /**
   * The CSS z-index on the root node that renders overlays
   * @default 9999999
   */
  zIndex?: SanityVisualEditingZIndex
}
export type SanityModuleOptions = Partial<MinimalClientConfig | SanityClientConfig> & {
  /** Globally register a $sanity helper throughout your app */
  globalHelper?: boolean
  /**
   * Use a micro-client that only supports making queries.
   * @default false
   */
  minimal?: boolean
  /**
   * Don't disable `useCdn` when preview mode is on
   * https://nuxtjs.org/docs/2.x/features/live-preview/
   *
   * @default false
   */
  disableSmartCdn?: boolean
  /**
   * Configuration for any additional clients
   */
  additionalClients?: Record<string, Partial<MinimalClientConfig | SanityClientConfig>>
  /**
   * Configuration for Live Content API
   */
  liveContent?: {
    browserToken?: string
    serverToken?: string
  }
  /**
   * The endpoint that useSanityQuery will use to proxy requests
   */
  proxyEndpoint?: string
  /**
   * Configuration for visual editing
   */
  visualEditing?: SanityModuleVisualEditingOptions
  /**
   * Path to Sanity config file to try to read `projectId` and `dataset` if they are not provided
   *
   * @default '~~/cms/sanity.config.ts'
   */
  configFile?: string
}

export type ModuleOptions = SanityModuleOptions

const logger = useLogger('@nuxtjs/sanity')

const CONFIG_KEY = 'sanity' as const

export default defineNuxtModule<SanityModuleOptions>({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: '>=3.7.0',
    },
  },
  defaults: {
    additionalClients: {},
    apiVersion: '1',
    disableSmartCdn: false,
    perspective: 'raw',
    withCredentials: false,
    configFile: '~~/cms/sanity.config',
  },
  async setup(options, nuxt) {
    // If explicit configuration is not provided, attempt to load it from `sanity.config.ts`
    if (!options.projectId || !options.dataset) {
      // Register watcher on sanity.config.ts
      const sanityConfigPath = await resolvePath(options.configFile!) || /* backwards compatibility */ resolve(nuxt.options.rootDir, './sanity.json')
      const relativeSanityConfigPath = relative(nuxt.options.rootDir, sanityConfigPath)
      if (!relativeSanityConfigPath.startsWith('..')) {
        nuxt.options.watch.push(createRegExp(exactly(relativeSanityConfigPath)))
      }
      const jiti = createJiti(import.meta.url, { jsx: true })
      if (existsSync(sanityConfigPath)) {
        const sanityConfig = await jiti.import(sanityConfigPath, { default: true, try: true }) as { projectId?: string, dataset?: string }
        if (sanityConfig) {
          options.projectId ||= sanityConfig.projectId
          options.dataset ||= sanityConfig.dataset
        }
      }
    }

    options.dataset ||= 'production'

    /**
     * Validate the live content configuration
     */
    if (options.liveContent && options.minimal) {
      throw new Error('Live Content API is not supported by the minimal client.')
    }

    /**
     * Validate the visual editing configuration
     */
    if (options.visualEditing) {
      try {
        if (options.minimal) {
          throw new Error('Minimal client is enabled.')
        }
        if (!options.visualEditing.token) {
          throw new Error(`'token' is required.`)
        }
        if (!options.visualEditing.studioUrl) {
          throw new Error(`'studioUrl' is required.`)
        }
        if (options.apiVersion === '1') {
          throw new Error(`The specified API Version must be ${colors.bold('2021-03-25')} or later.`)
        }
      }
      catch (e) {
        options.visualEditing = undefined
        if (e instanceof Error) {
          logger.warn(`Could not enable visual editing: ${e.message}`)
        }
      }
    }

    /**
     * Setup the base runtime configurations
     */
    const runtimeConfig: SanityRuntimeConfig = {}
    const publicRuntimeConfig: SanityPublicRuntimeConfig = {
      additionalClients: options.additionalClients || {},
      apiVersion: options.apiVersion || '1',
      dataset: options.dataset,
      disableSmartCdn: options.disableSmartCdn ?? false,
      perspective: options.perspective || 'raw',
      projectId: options.projectId || '',
      proxyEndpoint: options.proxyEndpoint || '',
      stega: (options.visualEditing && options.visualEditing.stega !== false && ({
        enabled: true,
        studioUrl: options.visualEditing.studioUrl,
      } as StegaConfig)) || {},
      token: options.token || '',
      useCdn: options.useCdn ?? true,
      withCredentials: options.withCredentials ?? false,
    }

    /**
     * Augment runtime configs with visual editing configuration, if present
     */
    if (options.visualEditing) {
      const previewMode = (options.visualEditing.previewMode !== false
        ? defu(options.visualEditing.previewMode, {
            enable: '/preview/enable',
            disable: '/preview/disable',
          })
        : false) as { enable: string, disable: string } | false

      runtimeConfig.visualEditing = {
        previewModeId: previewMode ? crypto.randomBytes(16).toString('hex') : '',
        token: options.visualEditing.token || '',
      }

      publicRuntimeConfig.visualEditing = {
        mode: options.visualEditing.mode || 'live-visual-editing',
        previewMode,
        previewModeId: '',
        proxyEndpoint: options.visualEditing.proxyEndpoint || '/_sanity/visual-editing/fetch',
        studioUrl: options.visualEditing.studioUrl || '',
        token: '',
        zIndex: options.visualEditing.zIndex,
      }
    }

    /**
     * Augment runtime configs with live content configuration, if present
     */
    if (options.liveContent) {
      runtimeConfig.liveContent = {
        serverToken: options.liveContent.serverToken || '',
      }

      publicRuntimeConfig.liveContent = {
        browserToken: options.liveContent.browserToken || '',
        serverToken: '',
      }
    }

    /**
     * Merge with existing runtime configs
     */
    nuxt.options.runtimeConfig.sanity = defu(nuxt.options.runtimeConfig.sanity, runtimeConfig)
    const { projectId, dataset } = (nuxt.options.runtimeConfig.public.sanity = defu(nuxt.options.runtimeConfig.public.sanity, publicRuntimeConfig))

    /**
     * Validate that a project ID has been provided
     */
    if (!projectId) {
      logger.warn(`No Sanity project found. Make sure you specify a ${colors.bold('projectId')} in your Sanity config.`)
    }
    else {
      logger.info(`Running with Sanity project ${colors.bold(projectId)} (${colors.bold(dataset)}).`)
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, '@nuxtjs/sanity')
    nuxt.options.build.transpile.push('@sanity/core-loader', '@sanity/preview-url-secret')

    const clientSpecifier = options.minimal ? join(runtimeDir, 'minimal-client') : '@sanity/client'

    addTemplate({
      filename: 'sanity-client.mjs',
      getContents: () => genExport(clientSpecifier, ['createClient']),
      write: true,
    })

    if (options.globalHelper) {
      addPlugin({ src: join(runtimeDir, 'plugins/global-helper') })
    }

    const composablesPath = join(runtimeDir, 'composables/index')

    addImports([
      { name: 'useSanity', from: composablesPath },
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', from: join(runtimeDir, 'groq') },
    ])

    addImports([
      { name: 'useSanityQuery', from: composablesPath },
      { name: 'useLazySanityQuery', from: composablesPath },
      { name: 'useSanityConfig', from: composablesPath },
      { name: 'useSanityPerspective', from: composablesPath },
      { name: 'useSanityVisualEditingState', from: composablesPath },
      { name: 'useIsSanityLivePreview', from: composablesPath },
      { name: 'useIsSanityPresentationTool', from: composablesPath },
      { name: 'useSanityPreviewPerspective', from: composablesPath },
      { name: 'useSanityPreviewEnvironment', from: composablesPath },
      // Visual Editing
      { name: 'createDataAttribute', from: '@sanity/visual-editing', as: 'createSanityDataAttribute' },
      { name: 'sanityVisualEditingRefresh', from: '#build/sanity-visual-editing-refresh.mjs' },
      { name: 'useSanityLiveMode', from: composablesPath },
      { name: 'useSanityVisualEditing', from: composablesPath },
    ])

    /**
     * Programatically update the TypeScript configuration to include paths for
     * the Sanity client and composables
     */
    const clientPath = await resolvePath(clientSpecifier)
    nuxt.hook('prepare:types', async ({ tsConfig }) => {
      tsConfig.compilerOptions ||= {}
      tsConfig.compilerOptions.paths['#sanity-client'] = [clientPath]
      tsConfig.compilerOptions.paths['#sanity-composables'] = [composablesPath]
    })

    nuxt.hook('nitro:config', (config) => {
      config.typescript = defu(config.typescript, {
        tsConfig: {
          compilerOptions: {
            paths: {
              ['#sanity-client']: [clientPath],
              ['#sanity-composables']: [composablesPath],
            },
          },
        },
      })

      if (config.imports === false) return

      config.virtual ||= {}
      config.virtual['#sanity-client'] = genExport(clientSpecifier, ['createClient'])

      config.externals ||= {}
      config.externals.inline ||= []
      config.externals.inline.push(runtimeDir)

      config.imports = defu(config.imports, {
        presets: [
          {
            from: '#sanity-client',
            imports: [{ name: 'createClient', as: 'createSanityClient' }],
          },
          {
            from: join(runtimeDir, 'server/utils/index'),
            imports: ['useSanity'],
          },
          {
            from: join(runtimeDir, 'groq'),
            imports: ['groq'],
          },
        ],
      })
    })

    await addComponentsDir({
      path: join(runtimeDir, 'components'),
      extensions: ['js', 'ts', 'mjs'],
    })

    if (options.liveContent) {
      addPlugin({
        mode: 'client',
        src: join(runtimeDir, 'plugins', 'live-content.client'),
      })
    }

    /**
     * Setup visual editing if configured
     */
    if (publicRuntimeConfig.visualEditing) {
      // Optimise visual editing dependencies
      nuxt.options.build.transpile.push('async-cache-dedupe')
      nuxt.options.vite.resolve = defu(nuxt.options.vite.resolve, {
        dedupe: ['@sanity/client'],
      })
      nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
        include: [
          '@nuxtjs/sanity > @sanity/visual-editing > @sanity/insert-menu',
          '@nuxtjs/sanity > @sanity/visual-editing > @sanity/mutate > lodash/groupBy.js',
          '@nuxtjs/sanity > @sanity/visual-editing > @sanity/ui > styled-components',
          '@nuxtjs/sanity > @sanity/visual-editing > @sanity/visual-editing > react-is',
          '@nuxtjs/sanity > @sanity/visual-editing > react',
          '@nuxtjs/sanity > @sanity/visual-editing > react/jsx-runtime',
          '@nuxtjs/sanity > @sanity/visual-editing > react-dom',
          '@nuxtjs/sanity > @sanity/visual-editing > react-dom/client',
          '@nuxtjs/sanity > @sanity/visual-editing > react-compiler-runtime',
          '@sanity/client',
        ],
      })

      nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
        include: [
          '@nuxtjs/sanity > @sanity/client > @sanity/visual-editing',
        ],
      })

      // Add auto-imports
      // Hacky(?) way to make the visual editing refresh function passed via
      // nuxt.config available on the client
      addTemplate({
        filename: 'sanity-visual-editing-refresh.mjs',
        getContents: () => `
            export const sanityVisualEditingRefresh = ${options.visualEditing?.refresh?.toString() || 'undefined'}
          `,
        write: true,
      })

      // Add server plugin to set visual editing state on app initialisation
      addPlugin({
        mode: 'server',
        src: join(runtimeDir, 'plugins', 'visual-editing.server'),
      })

      if (publicRuntimeConfig.visualEditing.mode !== 'custom') {
        // Add client plugin to handle visual editing unless some custom visual
        // editing implemention is being provided (i.e. 'custom' mode)
        addPlugin({
          mode: 'client',
          src: join(runtimeDir, 'plugins', 'visual-editing.client'),
        })
        logger.info(`Visual editing enabled globally.`)
      }
      else {
        logger.info(`Call ${colors.bold('useSanityVisualEditing()')} in your application to enable visual editing.`)
      }

      // Add an endpoint to proxy queries through when in preview mode, as we
      // need to use authentication to fetch preview data
      addServerHandler({
        method: 'post',
        route: publicRuntimeConfig.visualEditing.proxyEndpoint,
        handler: join(runtimeDir, 'server/routes/preview/proxy'),
      })

      // Add endpoints to handle enabling and disabling preview mode
      if (publicRuntimeConfig.visualEditing.previewMode !== false) {
        addServerHandler({
          method: 'get',
          route: publicRuntimeConfig.visualEditing.previewMode.enable,
          handler: join(runtimeDir, 'server/routes/preview/enable'),
        })
        addServerHandler({
          method: 'get',
          route: publicRuntimeConfig.visualEditing.previewMode.disable,
          handler: join(runtimeDir, 'server/routes/preview/disable'),
        })

        logger.info(
          `Preview mode enabled. Added routes at: ${Object.values(publicRuntimeConfig.visualEditing.previewMode)
            .map(route => colors.bold(route))
            .join(', ')}.`,
        )
      }
    }

    /**
     * Support for proxying requests
     *
     * To support private datasets/proxying requests, we find GROQ queries in
     * project source files. These can be used to construct a whitelist of
     * queries that the user can compare against in their proxy event handler
     */

    // Path to the file we will store found GROQ queries in (.nuxt directory)
    const queriesFilePath = join(nuxt.options.buildDir, 'sanity-groq-queries.json')

    let writeTimer: NodeJS.Timeout | null = null
    // Function used to write found GROQ queries to the filesystem
    const writeQueriesFile = (queryArr: SanityGroqQueryArray) => {
      if (writeTimer) clearTimeout(writeTimer)
      writeTimer = setTimeout(async () => {
        try {
          await writeFile(queriesFilePath, JSON.stringify(queryArr), 'utf8')
        }
        catch {
          // Ignore
        }
      }, 25)
    }

    // A virtual module to expose the filepath where the GROQ queries are stored
    // @todo Maybe this is unnecessary and there's a cleaner way to pass the filepath
    addServerTemplate({
      filename: '#sanity-groq-queries-info',
      getContents: () =>
        `export const queriesFilePath = ${JSON.stringify(queriesFilePath)}`,
    })

    addTypeTemplate(
      {
        filename: 'types/sanity-groq-queries-info.d.ts',
        getContents: () => `declare module '#sanity-groq-queries-info' {
          export const queriesFilePath: string
        }`,
      },
      { nitro: true, node: true },
    )

    // Vite plugin that actually finds GROQ queries in the project source files
    addVitePlugin(() => {
      // Queries are stored in a Map where key is the filepath and value is an
      // array of GROQ queries
      const queryMap = new Map<string, string[]>()

      const queryMapToArray = (queryMap: SanityGroqQueryMap): SanityGroqQueryArray => {
        return Array.from(queryMap, ([filepath, queries]) => ({ filepath, queries }))
      }

      const update = () => {
        const queryArr = queryMapToArray(queryMap)
        // Prefer to write to the filesystem...
        writeQueriesFile(queryArr)

        // ...but fallback to globalThis
        const g = globalThis as SanityDevGlobals
        g.__groqQueries ||= queryArr
      }

      return {
        name: 'vite-groq-queries-finder',
        enforce: 'pre',
        transform(code, id) {
          // Strip Vite's query suffixes (?macro=true, etc.), just leave the filepath
          const [filepath] = id.split('?', 2)
          if (!filepath) return null

          const relativePath = relative(nuxt.options.rootDir, filepath)
          // Ignore files outside of the project root
          if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
            return null
          }

          const filename = basename(filepath)

          try {
            const found = findQueriesInSource(code, filename)
            const prev = queryMap.get(relativePath)
            const next = found?.length ? found.map(f => f.result) : undefined
            // If we found new queries or the existing ones have changed, update the map
            if (next && (!prev || next.length !== prev.length || next.some((v, i) => v !== prev[i]))) {
              queryMap.set(relativePath, next)
              update()
            }
            // If we found no queries but had some before, remove them
            else if (!next && prev) {
              queryMap.delete(relativePath)
              update()
            }
          }
          catch {
            // Ignore
          }
          return null
        },
        // Handle deleted files
        watchChange(id, change) {
          if (change.event === 'delete') {
            const relativePath = relative(nuxt.options.rootDir, id)
            if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`)) return
            if (queryMap.delete(relativePath)) update()
          }
        },
        // Update even if bundle fails or process stops
        buildEnd: update,
        // Update at the end of Rollup's process, after the bundle has been written
        closeBundle: update,
        // Runs before build/transform to ensure the queries file exists early
        configResolved() {
          const queries = queryMapToArray(queryMap)
          writeQueriesFile(queries)
        },
      }
    })

    // Add a virtual module to expose GROQ queries in production
    const VIRTUAL_ID = '#sanity-groq-queries'
    const RESOLVED_ID = '\0' + VIRTUAL_ID

    const proxyUtilsPath = join(runtimeDir, 'server/utils/proxy')

    // Add auto-imports for proxy utils. Currently types will not be generated
    // for explicitly importing via #imports.
    addServerImports([
      { name: 'validateQuery', as: 'validateSanityQuery', from: proxyUtilsPath },
      { name: 'getGroqQueries', as: 'getSanityGroqQueries', from: proxyUtilsPath },
    ])

    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig ||= {}
      config.rollupConfig.plugins ||= []
      if (Array.isArray(config.rollupConfig.plugins)) {
        config.rollupConfig.plugins.push({
          name: 'nitro-groq-queries',
          resolveId(id) {
            return id === VIRTUAL_ID ? RESOLVED_ID : null
          },
          async load(id) {
            if (id !== RESOLVED_ID) return null
            try {
              const raw = await readFile(queriesFilePath, 'utf8')
              // We trust the file was written as valid JSON
              return `export const queryArr = ${raw};`
            }
            catch {
              return `export const queryArr = [];`
            }
          },
        })
      }
    })

    addTypeTemplate(
      {
        filename: `types/${VIRTUAL_ID}.d.ts`,
        getContents: () => `
        declare module '${VIRTUAL_ID}' {
          export const queryArr: Array<{ filepath: string, queries: string[] }>
        }`,
      },
      { nitro: true, node: true },
    )
  },
})
