import { fileURLToPath } from 'url'
import { defineNuxtModule, requireModule, addTemplate, addComponentsDir, addImports, isNuxt3, addPlugin, isNuxt2, useLogger } from '@nuxt/kit'

import chalk from 'chalk'
import * as fse from 'fs-extra'
import { join, resolve } from 'pathe'
import { defu } from 'defu'
import { genExport } from 'knitwork'

import { name, version } from '../package.json'

import type { SanityConfiguration } from './runtime/client'

export interface SanityModuleOptions extends Partial<SanityConfiguration> {
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
  additionalClients?: Record<string, Partial<SanityConfiguration>>
}

export type ModuleOptions = SanityModuleOptions

const logger = useLogger('@nuxtjs/sanity')

function getDefaultSanityConfig (jsonPath: string) {
  try {
    const { projectId, dataset } = fse.readJSONSync(jsonPath).api
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
    dataset: 'production',
    apiVersion: '1',
    withCredentials: false,
    additionalClients: {},
    ...getDefaultSanityConfig(resolve(nuxt.options.rootDir, './sanity.json')),
  }),
  async setup (options, nuxt) {
    if (!('useCdn' in options)) {
      options.useCdn = process.env.NODE_ENV === 'production' && !options.token
    }

    if (options.perspective === 'previewDrafts' && !options.useCdn) {
      logger.info("To use perspective: previewDrafts, useCdn must be set to true")
    }

    try {
      if (!options.minimal) {
        options.minimal = !requireModule('@sanity/client')
      }
    } catch {
      options.minimal = true
      logger.info(`Enabling minimal client as ${chalk.bold('@sanity/client')} is not installed.`)
    }

    // Final resolved configuration
    nuxt.options.runtimeConfig.sanity = nuxt.options.runtimeConfig.sanity || {}
    const { projectId, dataset } = nuxt.options.runtimeConfig.public.sanity = defu(nuxt.options.runtimeConfig.public.sanity, {
      useCdn: options.useCdn,
      projectId: options.projectId,
      dataset: options.dataset,
      apiVersion: options.apiVersion,
      withCredentials: options.withCredentials,
      token: options.token,
      additionalClients: options.additionalClients,
      perspective: options.perspective,
    })

    if (!projectId) {
      logger.warn(`No Sanity project found. Make sure you specify a ${chalk.bold('projectId')} in your Sanity config.`)
    } else {
      logger.info(`Running with Sanity project ${chalk.bold(projectId)} (${chalk.bold(dataset)}).`)
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, '@nuxtjs/sanity')

    addTemplate({
      filename: 'sanity-client.mjs',
      getContents: () =>
        options.minimal
          ? genExport(join(runtimeDir, 'client'), ['createClient'])
          : genExport('@sanity/client', [{ name: 'createClient' }]),
    })

    if (options.globalHelper) {
      addPlugin({ src: join(runtimeDir, 'plugin') })
      if (isNuxt2()) {
        nuxt.hook('prepare:types', ({ references }) => {
          references.push({ types: '@nuxtjs/sanity/dist/runtime/plugin' })
        })
      }
    }

    addImports([
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', as: 'groq', from: join(runtimeDir, 'groq') },
      { name: 'useSanity', as: 'useSanity', from: join(runtimeDir, 'composables') },
      { name: 'useLazySanityQuery', as: 'useLazySanityQuery', from: join(runtimeDir, 'composables') },
      isNuxt3() && { name: 'useSanityQuery', as: 'useSanityQuery', from: join(runtimeDir, 'composables') },
    ].filter(Boolean))

    nuxt.hook('prepare:types', ({ tsConfig }) => {
      tsConfig.compilerOptions ||= {}
      tsConfig.compilerOptions.paths['#sanity-client'] = [join(runtimeDir, 'client')]
    })

    nuxt.hook('nitro:config', (config) => {
      if (config.imports === false) return

      config.virtual ||= {}
      config.virtual['#sanity-client'] =
        options.minimal
          ? genExport(join(runtimeDir, 'client'), ['createClient'])
          : genExport('@sanity/client', [{ name: 'createClient' }])

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
  },
})
