import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import jiti from 'jiti'
import { createRegExp, exactly } from 'magic-regexp'
import {
  addComponentsDir,
  addImports,
  addPlugin,
  addServerHandler,
  addTemplate,
  defineNuxtModule,
  resolvePath,
  isNuxt2,
  isNuxt3,
  useLogger,
} from '@nuxt/kit'

import chalk from 'chalk'
import { dirname, join, relative, resolve } from 'pathe'
import { defu } from 'defu'
import { genExport } from 'knitwork'

import type { ClientConfig as SanityClientConfig, StegaConfig } from '@sanity/client'
import { type HistoryRefresh, type VisualEditingOptions } from '@sanity/visual-editing'
import { name, version } from '../package.json'

import type { ClientConfig as MinimalClientConfig } from './runtime/minimal-client'

export type SanityVisualEditingMode = 'live-visual-editing' | 'visual-editing' | 'custom'

export type SanityVisualEditingRefreshHandler = (
  payload: HistoryRefresh,
  refreshDefault: () => false | Promise<void>,
) => false | Promise<void>

export type SanityVisualEditingZIndex = VisualEditingOptions['zIndex']

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
   * Set proxy endpoint for fetching preview data
   * @default '/_sanity/fetch'
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
      nuxt: '^3.7.0',
      bridge: true,
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
      const load = jiti(dirname(import.meta.url), {
        esmResolve: true,
        interopDefault: true,
        cache: false,
        requireCache: false,
      })
      if (existsSync(sanityConfigPath)) {
        const sanityConfig = await load(sanityConfigPath)
        if (sanityConfig) {
          options.projectId ||= sanityConfig.projectId
          options.dataset ||= sanityConfig.dataset
        }
      }
    }

    options.dataset ||= 'production'

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
          throw new Error(`The specified API Version must be ${chalk.bold('2021-03-25')} or later.`)
        }
      }
      catch (e) {
        options.visualEditing = undefined
        if (e instanceof Error) {
          logger.warn(`Could not enable visual editing: ${e.message}`)
        }
      }
    }

    // Final resolved configuration
    const visualEditing = options.visualEditing && {
      mode: options.visualEditing.mode || 'live-visual-editing',
      previewMode: (options.visualEditing.previewMode !== false
        ? defu(options.visualEditing.previewMode, {
          enable: '/preview/enable',
          disable: '/preview/disable',
        })
        : false) as { enable: string, disable: string } | false,
      proxyEndpoint: options.visualEditing.proxyEndpoint || '/_sanity/fetch',
      refresh: options.visualEditing.refresh,
      studioUrl: options.visualEditing.studioUrl || '',
      zIndex: options.visualEditing.zIndex,
    }

    nuxt.options.runtimeConfig.sanity = defu(nuxt.options.runtimeConfig.sanity, {
      visualEditing: options.visualEditing && {
        ...visualEditing,
        previewModeId: visualEditing!.previewMode ? crypto.randomBytes(16).toString('hex') : '',
        token: options.visualEditing.token || '',
      },
    })

    const { projectId, dataset } = (nuxt.options.runtimeConfig.public.sanity
      = defu(nuxt.options.runtimeConfig.public.sanity, {
        additionalClients: options.additionalClients, // has default
        apiVersion: options.apiVersion, // has default
        dataset: options.dataset, // has default
        disableSmartCdn: options.disableSmartCdn, // has default
        perspective: options.perspective, // has default
        projectId: options.projectId || '',
        stega:
          (options.visualEditing && options.visualEditing?.stega !== false
          && ({
            enabled: true,
            studioUrl: options.visualEditing.studioUrl,
          } as StegaConfig))
          || {},
        token: options.token || '',
        useCdn: options.useCdn, // enforced
        visualEditing: visualEditing,
        withCredentials: options.withCredentials, // has default
      }))

    if (!projectId) {
      logger.warn(`No Sanity project found. Make sure you specify a ${chalk.bold('projectId')} in your Sanity config.`)
    }
    else {
      logger.info(`Running with Sanity project ${chalk.bold(projectId)} (${chalk.bold(dataset)}).`)
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, '@nuxtjs/sanity')
    nuxt.options.build.transpile.push('@sanity/core-loader', '@sanity/preview-url-secret')

    const clientSpecifier = options.minimal ? join(runtimeDir, 'minimal-client') : '@sanity/client'

    addTemplate({
      filename: 'sanity-client.mjs',
      getContents: () => genExport(clientSpecifier, ['createClient']),
    })

    if (options.globalHelper) {
      addPlugin({ src: join(runtimeDir, 'plugins/global-helper') })
      if (isNuxt2()) {
        nuxt.hook('prepare:types', ({ references }) => {
          references.push({ types: '@nuxtjs/sanity/dist/runtime/plugins/global-helper' })
        })
      }
    }

    const composablesFile = visualEditing ? join(runtimeDir, 'composables/visual-editing') : join(runtimeDir, 'composables/index')

    addImports([
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', from: join(runtimeDir, 'groq') },
      { name: 'useSanity', from: composablesFile },
      { name: 'useLazySanityQuery', from: join(runtimeDir, 'composables/index') },
      ...isNuxt3() ? [{ name: 'useSanityQuery', from: composablesFile }] : [],
    ])

    const clientPath = await resolvePath(clientSpecifier)
    nuxt.hook('prepare:types', async ({ tsConfig }) => {
      tsConfig.compilerOptions ||= {}
      tsConfig.compilerOptions.paths['#sanity-client'] = [clientPath]
      tsConfig.compilerOptions.paths['#sanity-composables'] = [composablesFile]
    })

    nuxt.hook('nitro:config', (config) => {
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

    if (visualEditing) {
      // Optimise dependencies of visual editing
      nuxt.options.build.transpile.push('async-cache-dedupe')
      nuxt.options.vite.resolve = defu(nuxt.options.vite.resolve, {
        dedupe: ['@sanity/client'],
      })
      nuxt.options.vite.optimizeDeps = defu(nuxt.options.vite.optimizeDeps, {
        include: [
          '@nuxtjs/sanity > @sanity/core-loader > async-cache-dedupe',
          '@nuxtjs/sanity > @sanity/visual-editing > @sanity/visual-editing > react-is',
          '@nuxtjs/sanity > @sanity/visual-editing > react',
          '@nuxtjs/sanity > @sanity/visual-editing > react/jsx-runtime',
          '@nuxtjs/sanity > @sanity/visual-editing > react-dom',
          '@nuxtjs/sanity > @sanity/visual-editing > react-dom/client',
          '@sanity/client > get-it > debug',
          '@sanity/client > get-it > parse-headers',
          '@sanity/client',
        ],
      })
      // Add auto-imports for visual editing
      if (isNuxt3()) {
        addImports([
          { name: 'useSanityLiveMode', from: composablesFile },
          { name: 'useSanityVisualEditing', from: composablesFile },
          { name: 'useSanityVisualEditingState', from: composablesFile },
        ])
      }

      // Plugin to check visual editing on app initialisation
      addPlugin({
        mode: 'server',
        src: join(runtimeDir, 'plugins', 'visual-editing.server'),
      })

      if (visualEditing.mode !== 'custom') {
        addPlugin({
          mode: 'client',
          src: join(runtimeDir, 'plugins', 'visual-editing.client'),
        })
        logger.info(`Visual editing enabled globally.`)
      }
      else {
        logger.info(`Call ${chalk.bold('useSanityVisualEditing()')} in your application to enable visual editing.`)
      }

      addServerHandler({
        method: 'post',
        route: visualEditing.proxyEndpoint,
        handler: join(runtimeDir, 'server/routes/proxy'),
      })

      if (visualEditing?.previewMode !== false) {
        addServerHandler({
          method: 'get',
          route: visualEditing.previewMode.enable,
          handler: join(runtimeDir, 'server/routes/preview/enable'),
        })
        addServerHandler({
          method: 'get',
          route: visualEditing.previewMode.disable,
          handler: join(runtimeDir, 'server/routes/preview/disable'),
        })

        logger.info(
          `Preview mode enabled. Added routes at: ${Object.values(visualEditing.previewMode)
            .map(route => chalk.bold(route))
            .join(', ')}.`,
        )
      }
    }
  },
})
