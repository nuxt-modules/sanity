import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { createJiti } from 'jiti'
import { createRegExp, exactly } from 'magic-regexp'
import {
  addComponent,
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
  updateTemplates,
  useLogger,
} from '@nuxt/kit'

import { colors } from 'consola/utils'
import { isAbsolute, basename, join, relative, resolve, sep } from 'pathe'
import { defu } from 'defu'
import { genExport } from 'knitwork'

import { findQueriesInSource } from '@sanity/codegen'
import type { ClientConfig as SanityClientConfig, StegaConfig } from '@sanity/client'
import type { HistoryRefresh } from '@sanity/visual-editing'
import { normalizeQuery } from './runtime/util/normalizeQuery'
import { name, version } from '../package.json'

import type { ClientConfig as MinimalClientConfig } from './runtime/minimal-client'
import type { SanityGroqQueryArray, SanityGroqQueryMap, SanityPublicRuntimeConfig, SanityRuntimeConfig, SanityVisualEditingZIndex } from './runtime/types'
import { extractSchemaFromTypesFile } from './runtime/typegen/schema-extractor'
import { generateSanityTypes } from './runtime/typegen/type-generator'

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

export interface SanityTypegenOptions {
  /**
   * Enable programmatic schema/query type generation.
   *
   * @default false
   */
  enabled?: boolean
  /**
   * Path to a module exporting your schema types array (e.g. `cms/schemaTypes/index.ts`).
   */
  schemaTypesPath?: string
  /**
   * The export name to read schema types from.
   *
   * @default 'schemaTypes'
   */
  schemaTypesExport?: string
  /**
   * Glob(s) to scan for GROQ queries.
   */
  queryPaths?: string | string[]
  /**
   * Generate `@sanity/client` query overloads.
   *
   * @default true
   */
  overloadClientMethods?: boolean
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
   * The endpoint `useSanityQuery` sends requests to. Defaults to the Sanity
   * API, but can be overridden to point at a custom handler (e.g. your own
   * server-side proxy).
   */
  queryEndpoint?: string
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
  /**
   * Programmatic Sanity type generation.
   */
  typegen?: SanityTypegenOptions
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
      queryEndpoint: options.queryEndpoint || '',
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
    nuxt.options.runtimeConfig.public.sanity = defu(nuxt.options.runtimeConfig.public.sanity, publicRuntimeConfig)
    const { projectId, dataset } = nuxt.options.runtimeConfig.public.sanity

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

    addImports([
      { name: 'useSanity', from: join(runtimeDir, 'composables/useSanity') },
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', from: join(runtimeDir, 'groq') },
      { name: 'defineQuery', from: join(runtimeDir, 'groq') },
    ])

    addImports([
      { name: 'useSanityQuery', from: join(runtimeDir, 'composables/useSanityQuery') },
      { name: 'useLazySanityQuery', from: join(runtimeDir, 'composables/useLazySanityQuery') },
      { name: 'useSanityConfig', from: join(runtimeDir, 'composables/useSanityConfig') },
      { name: 'useSanityPerspective', from: join(runtimeDir, 'composables/useSanityPerspective') },
      { name: 'useSanityVisualEditingState', from: join(runtimeDir, 'composables/useSanityVisualEditingState') },
      { name: 'useIsSanityLivePreview', from: join(runtimeDir, 'composables/useIsSanityLivePreview') },
      { name: 'useIsSanityPresentationTool', from: join(runtimeDir, 'composables/useIsSanityPresentationTool') },
      { name: 'useSanityPreviewPerspective', from: join(runtimeDir, 'composables/useSanityPreviewPerspective') },
      { name: 'useSanityPreviewEnvironment', from: join(runtimeDir, 'composables/useSanityPreviewEnvironment') },
    ])

    let typegenTemplate: { filename: string, dst: string } | null = null

    if (options.typegen?.enabled) {
      if (!options.typegen.schemaTypesPath) {
        logger.warn('Sanity typegen is enabled but `schemaTypesPath` is missing.')
      }
      else {
        const schemaTypesPath = await resolvePath(options.typegen.schemaTypesPath)

        const queryPaths = options.typegen.queryPaths
          ? (Array.isArray(options.typegen.queryPaths) ? options.typegen.queryPaths : [options.typegen.queryPaths])
          : [join(nuxt.options.srcDir, '**/*.{ts,tsx,js,jsx,mjs,cjs,vue,astro}')]

        const resolvedQueryPaths = queryPaths.map(p => isAbsolute(p) ? p : resolve(nuxt.options.rootDir, p))

        // Generate types and extract type names for auto-imports
        const generateTypes = async () => {
          const schema = await extractSchemaFromTypesFile({
            typesPath: schemaTypesPath,
            exportName: options.typegen?.schemaTypesExport,
          })

          const result = await generateSanityTypes({
            schema,
            queryPaths: resolvedQueryPaths,
            rootDir: nuxt.options.rootDir,
            overloadClientMethods: options.typegen?.overloadClientMethods,
          })

          if (result.errors.length) {
            const uniqueErrors = [...new Set(result.errors)]
            const maxErrors = 10

            logger.warn(
              `Sanity typegen skipped ${uniqueErrors.length} error(s):\n${uniqueErrors
                .slice(0, maxErrors)
                .map(e => `- ${e}`)
                .join('\n')}${uniqueErrors.length > maxErrors ? '\n- (truncated)' : ''}`,
            )
          }

          return result
        }

        // Generate types once at setup to get type names for auto-imports
        let cachedResult: Awaited<ReturnType<typeof generateTypes>> | null = null
        const getTypesResult = async () => {
          if (!cachedResult) {
            try {
              cachedResult = await generateTypes()
            }
            catch (error) {
              const message = error instanceof Error ? error.message : String(error)
              logger.warn(`Could not generate Sanity types: ${message}`)
              cachedResult = { code: 'export {}', fileCount: 0, errors: [], typeNames: [] }
            }
          }
          return cachedResult
        }

        typegenTemplate = addTypeTemplate({
          filename: 'types/sanity-typegen.d.ts',
          getContents: async () => {
            const result = await getTypesResult()
            return `// Generated by @nuxtjs/sanity\n${result.code}`
          },
          write: true,
        }, { nitro: true })

        // Add generated types as auto-imports
        // Use relative path from .nuxt/types/imports.d.ts to .nuxt/types/sanity-typegen.d.ts
        nuxt.hook('imports:extend', async (imports) => {
          const result = await getTypesResult()
          for (const typeName of result.typeNames) {
            imports.push({
              name: typeName,
              from: typegenTemplate!.dst,
              typeFrom: './sanity-typegen',
              type: true,
            })
          }
        })

        if (nuxt.options.dev) {
          nuxt.options.watch.push(schemaTypesPath)

          nuxt.hook('builder:watch', async (_event, path) => {
            if (!typegenTemplate) return

            const changedPath = isAbsolute(path) ? path : resolve(nuxt.options.rootDir, path)

            const isSchemaChange = changedPath === schemaTypesPath
            const relativeToSrc = relative(nuxt.options.srcDir, changedPath)
            const isInSrcDir = !relativeToSrc.startsWith('..')
            const isSupportedExt = /\.(?:ts|tsx|js|jsx|mjs|cjs|vue|astro)$/.test(changedPath)

            if (!isSchemaChange && !(isInSrcDir && isSupportedExt)) {
              return
            }

            // Invalidate cache and regenerate
            cachedResult = null
            await updateTemplates({
              filter: template => template.dst === typegenTemplate!.dst,
            })
          })
        }

        logger.info('Sanity type generation enabled.')
      }
    }

    /**
     * Generate a dynamic barrel export for composables that conditionally
     * includes Visual Editing composables only when configured
     */
    const composablesTemplate = addTemplate({
      filename: 'sanity-composables.mjs',
      getContents: () => {
        const baseExports = [
          `export { useSanity } from '${join(runtimeDir, 'composables/useSanity')}'`,
          `export { useSanityQuery } from '${join(runtimeDir, 'composables/useSanityQuery')}'`,
          `export { useLazySanityQuery } from '${join(runtimeDir, 'composables/useLazySanityQuery')}'`,
          `export { useSanityConfig } from '${join(runtimeDir, 'composables/useSanityConfig')}'`,
          `export { useSanityPerspective } from '${join(runtimeDir, 'composables/useSanityPerspective')}'`,
          `export { useSanityVisualEditingState } from '${join(runtimeDir, 'composables/useSanityVisualEditingState')}'`,
          `export { useIsSanityLivePreview } from '${join(runtimeDir, 'composables/useIsSanityLivePreview')}'`,
          `export { useIsSanityPresentationTool } from '${join(runtimeDir, 'composables/useIsSanityPresentationTool')}'`,
          `export { useSanityPreviewPerspective } from '${join(runtimeDir, 'composables/useSanityPreviewPerspective')}'`,
          `export { useSanityPreviewEnvironment } from '${join(runtimeDir, 'composables/useSanityPreviewEnvironment')}'`,
        ]

        const visualEditingExports = publicRuntimeConfig.visualEditing
          ? [
              `export { useSanityVisualEditing } from '${join(runtimeDir, 'composables/useSanityVisualEditing')}'`,
              `export { useSanityLiveMode } from '${join(runtimeDir, 'composables/useSanityLiveMode')}'`,
            ]
          : []

        return [...baseExports, ...visualEditingExports].join('\n')
      },
      write: true,
    })

    /**
     * Programatically update the TypeScript configuration to include paths for
     * the Sanity client and composables
     */
    const clientPath = await resolvePath(clientSpecifier)
    nuxt.hook('prepare:types', async ({ tsConfig }) => {
      tsConfig.compilerOptions ||= {}
      tsConfig.compilerOptions.paths ||= {}
      tsConfig.compilerOptions.paths['#sanity-client'] = [clientPath]
      tsConfig.compilerOptions.paths['#sanity-composables'] = [composablesTemplate.dst]
    })

    nuxt.hook('nitro:config', (config) => {
      config.typescript = defu(config.typescript, {
        tsConfig: {
          compilerOptions: {
            paths: {
              ['#sanity-client']: [clientPath],
              ['#sanity-composables']: [composablesTemplate.dst],
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
            imports: ['groq', 'defineQuery'],
          },
        ],
      })
    })

    await addComponentsDir({
      path: join(runtimeDir, 'components'),
      extensions: ['js', 'ts', 'mjs'],
      // Exclude sanity-image variants (registered separately via virtual template)
      ignore: ['**/sanity-image-*.ts'],
    })

    // Add SanityImage component - uses NuxtImg variant if @nuxt/image is available
    addTemplate({
      filename: 'sanity-image.mjs',
      write: true,
      getContents: ({ app }) => {
        const hasNuxtImage = app.components.some(c =>
          c.pascalName === 'NuxtImg'
          && !c.filePath.includes('nuxt/dist/app')
          && !c.filePath.includes('nuxt-nightly/dist/app'),
        )
        const componentPath = hasNuxtImage
          ? join(runtimeDir, 'components/sanity-image-nuxt')
          : join(runtimeDir, 'components/sanity-image-base')
        return `export { default } from ${JSON.stringify(componentPath)}`
      },
    })

    addComponent({
      name: 'SanityImage',
      filePath: '#build/sanity-image.mjs',
    })

    if (options.liveContent || publicRuntimeConfig.visualEditing) {
      addPlugin({
        mode: 'client',
        src: join(runtimeDir, 'plugins', 'preview-environment.client'),
      })
    }

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

      // Add Visual Editing auto-imports
      addImports([
        { name: 'createDataAttribute', from: '@sanity/visual-editing', as: 'createSanityDataAttribute' },
        { name: 'sanityVisualEditingRefresh', from: '#build/sanity-visual-editing-refresh.mjs' },
        { name: 'useSanityLiveMode', from: join(runtimeDir, 'composables/useSanityLiveMode') },
        { name: 'useSanityVisualEditing', from: join(runtimeDir, 'composables/useSanityVisualEditing') },
      ])

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
        catch (err) {
          if (nuxt.options.dev) {
            logger.warn('Failed to write GROQ queries file:', err)
          }
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
        writeQueriesFile(queryArr)
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
            const next = found.queries?.length ? found.queries.map(f => normalizeQuery(f.query)) : undefined
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
          catch (err) {
            if (nuxt.options.dev) {
              logger.debug(`Failed to extract GROQ queries from ${relativePath}:`, err)
            }
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
      { name: 'validateSanityQuery', from: proxyUtilsPath },
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
      else if (nuxt.options.dev) {
        logger.warn('Nitro rollupConfig.plugins is not an array, skipping GROQ queries plugin')
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
