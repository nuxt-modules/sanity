import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import {
  addComponentsDir,
  addImports,
  addPlugin,
  addServerHandler,
  addTemplate,
  defineNuxtModule,
  isNuxt2,
  isNuxt3,
  tryResolveModule,
  requireModule,
  resolveModule,
  useLogger,
} from '@nuxt/kit'

import chalk from 'chalk'
import { join, resolve } from 'pathe'
import { defu } from 'defu'
import { genExport } from 'knitwork'

import { name, version } from '../package.json'

import type { ClientConfig as MinimalClientConfig } from './runtime/minimal-client'
import type { ClientConfig as SanityClientConfig, StegaConfig } from '@sanity/client'

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
   * @default 'global'
   */
  mode?: 'global' | 'component'
  /**
   * Read token for server side queries
   * @required
   */
  token?: string
  /**
   * The URL of the Sanity Studio
   * @required
   */
  studioUrl?: string
  /**
   * Enable stega
   * @required
   */
  stega?: boolean
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
}

export type ModuleOptions = SanityModuleOptions

const logger = useLogger('@nuxtjs/sanity')

function getDefaultSanityConfig (jsonPath: string) {
  try {
    const { projectId, dataset } = JSON.parse(readFileSync(jsonPath, 'utf-8').trim()).api
    return { projectId, dataset }
  } catch {
    return {}
  }
}

const CONFIG_KEY = 'sanity' as const

export default defineNuxtModule<SanityModuleOptions>({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      bridge: true,
    },
  },
  defaults: nuxt => ({
    additionalClients: {},
    apiVersion: '1',
    disableSmartCdn: false,
    dataset: 'production',
    perspective: 'raw',
    withCredentials: false,
    ...getDefaultSanityConfig(resolve(nuxt.options.rootDir, './sanity.json')),
  }),
  async setup (options, nuxt) {
    if (!('useCdn' in options)) {
      options.useCdn = process.env.NODE_ENV === 'production' && !options.token
    }

    try {
      if (!options.minimal) {
        options.minimal = !requireModule('@sanity/client')
      }
    } catch {
      options.minimal = true
      logger.info(`Enabling minimal client as ${chalk.bold('@sanity/client')} is not installed.`)
    }

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
        if (!(await tryResolveModule('@sanity/core-loader'))) {
          throw new Error(`${chalk.bold('@sanity/core-loader')} is not installed.`)
        }
        if (options.apiVersion === '1') {
          throw new Error(`The specified API Version must be ${chalk.bold('2021-03-25')} or later.`)
        }
      } catch (e) {
        options.visualEditing = undefined
        if (e instanceof Error) {
          logger.warn(`Could not enable visual editing: ${e.message}`)
        }
      }
    }

    // Final resolved configuration
    const visualEditing = options.visualEditing && {
      previewMode: (options.visualEditing.previewMode
        ? defu(options.visualEditing.previewMode, {
          enable: '/preview/enable',
          disable: '/preview/disable',
        })
        : false) as { enable: string; disable: string } | false,
      mode: options.visualEditing.mode || 'global',
      studioUrl: options.visualEditing.studioUrl || '',
    }

    nuxt.options.runtimeConfig.sanity = defu(nuxt.options.runtimeConfig.sanity, {
      visualEditing: options.visualEditing && {
        previewModeId: visualEditing!.previewMode ? crypto.randomBytes(16).toString('hex') : '',
        token: options.visualEditing.token || '',
      },
    })

    const { projectId, dataset } = (nuxt.options.runtimeConfig.public.sanity =
      defu(nuxt.options.runtimeConfig.public.sanity, {
        additionalClients: options.additionalClients, // has default
        apiVersion: options.apiVersion, // has default
        dataset: options.dataset, // has default
        disableSmartCdn: options.disableSmartCdn, // has default
        perspective: options.perspective, // has default
        projectId: options.projectId || '',
        stega:
          (options.visualEditing?.stega === true &&
            ({
              enabled: true,
              studioUrl: options.visualEditing.studioUrl,
            } as StegaConfig)) ||
          {},
        token: options.token || '',
        useCdn: options.useCdn, // enforced
        visualEditing: visualEditing,
        withCredentials: options.withCredentials, // has default
      }))

    if (!projectId) {
      logger.warn(`No Sanity project found. Make sure you specify a ${chalk.bold('projectId')} in your Sanity config.`)
    } else {
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
      addPlugin({ src: join(runtimeDir, 'plugin') })
      if (isNuxt2()) {
        nuxt.hook('prepare:types', ({ references }) => {
          references.push({ types: '@nuxtjs/sanity/dist/runtime/plugin' })
        })
      }
    }

    const visualEditingDir = join(runtimeDir, 'visual-editing')
    const composablesDir = options.visualEditing ? visualEditingDir : runtimeDir

    addImports([
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', as: 'groq', from: join(runtimeDir, 'groq') },
      { name: 'useSanity', as: 'useSanity', from: join(composablesDir, 'composables') },
      { name: 'useLazySanityQuery', as: 'useLazySanityQuery', from: join(runtimeDir, 'composables') },
      ...isNuxt3() ? [{ name: 'useSanityQuery', as: 'useSanityQuery', from: join(composablesDir, 'composables') }] : [],
    ])

    const clientPath = await resolveModule(clientSpecifier)
    nuxt.hook('prepare:types', async ({ tsConfig }) => {
      tsConfig.compilerOptions ||= {}
      tsConfig.compilerOptions.paths['#sanity-client'] = [clientPath]
      tsConfig.compilerOptions.paths['#sanity-composables'] = [
        join(composablesDir, 'composables'),
      ]
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
            from: join(runtimeDir, 'nitro-imports'),
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

    if (options.visualEditing) {
      // Add auto-imports for visual editing
      if (isNuxt3()) {
        addImports([
          { name: 'useSanityLiveMode', as: 'useSanityLiveMode', from: join(visualEditingDir, 'composables') },
          { name: 'useSanityVisualEditing', as: 'useSanityVisualEditing', from: join(visualEditingDir, 'composables') },
        ])
      }

      // Plugin to check visual editing on app initialisation
      addPlugin({
        mode: 'server',
        src: join(visualEditingDir, 'plugins', 'server'),
      })

      if (
        options.visualEditing.mode === undefined ||
        options.visualEditing.mode === 'global'
      ) {
        addPlugin({
          mode: 'client',
          src: join(visualEditingDir, 'plugins', 'client'),
        })
        logger.info(`Visual editing enabled globally.`)
      } else {
        logger.info(`Call ${chalk.bold('useSanityVisualEditing()')} in your application to enable visual editing.`)
      }

      if (options.visualEditing?.previewMode) {
        const previewRoutes = defu(options.visualEditing.previewMode, {
          enable: '/preview/enable',
          disable: '/preview/disable',
        })

        const previewRoutesDir = join(visualEditingDir, 'preview')

        addServerHandler({
          method: 'get',
          route: previewRoutes.enable,
          handler: join(previewRoutesDir, 'enable'),
        })
        addServerHandler({
          method: 'get',
          route: previewRoutes.disable,
          handler: join(previewRoutesDir, 'disable'),
        })

        logger.info(
          `Preview mode enabled. Added routes at: ${Object.values(previewRoutes)
            .map(route => chalk.bold(route))
            .join(', ')}.`,
        )
      }
    }
  },
})
