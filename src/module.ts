import { fileURLToPath } from 'url'
import { defineNuxtModule, requireModule, addTemplate, addComponentsDir, addAutoImport, isNuxt3 } from '@nuxt/kit'

import chalk from 'chalk'
import consola from 'consola'
import * as fse from 'fs-extra'
import { join, resolve } from 'pathe'
import defu from 'defu'
import { genImport } from 'knitwork'

import { name, version } from '../package.json'

import type { SanityConfiguration } from './runtime/client'

export interface SanityModuleOptions extends Partial<SanityConfiguration> {
  /**
   * Use a micro-client that only supports making queries.
   * @default false
   */
  minimal?: boolean
  /**
   * Register a global SanityImage component to generate correct Sanity image URLs
   * @default true
   */
  imageHelper?: boolean
  /**
   * Register a global SanityContent component to serialize Sanity Portable Text
   * @default true
   */
  contentHelper?: boolean
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

function validateConfig ({ projectId, dataset }: SanityModuleOptions) {
  if (!projectId) {
    consola.warn(
      `Make sure you specify a ${chalk.bold(
        'projectId',
      )} in your sanity config.`,
    )
    return false
  } else {
    consola.info(
      `Enabled ${chalk.bold('@nuxtjs/sanity')} for project ${chalk.bold(
        projectId,
      )} (${chalk.bold(dataset)}).`,
    )
    return true
  }
}

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
    contentHelper: true,
    imageHelper: true,
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

    if (!validateConfig(options)) return

    try {
      if (!options.minimal) {
        options.minimal = !requireModule('@sanity/client')
      }
    } catch {
      options.minimal = true
      consola.info(
        `Enabling minimal client as ${chalk.bold('@sanity/client')} cannot be resolved in your project dependencies.
       Try running ${chalk.bold('yarn add @sanity/client')} or ${chalk.bold('npm install @sanity/client')}.
       To disable this warning, set ${chalk.bold('sanity: { minimal: true }')} in your nuxt.config.js.`,
      )
    }

    // Final resolved configuration
    nuxt.options.publicRuntimeConfig.sanity = defu(nuxt.options.publicRuntimeConfig.sanity, {
      useCdn: options.useCdn,
      projectId: options.projectId,
      dataset: options.dataset,
      apiVersion: options.apiVersion,
      withCredentials: options.withCredentials,
      token: options.token,
      additionalClients: options.additionalClients,
    })

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir, '@nuxtjs/sanity')

    addTemplate({
      filename: 'sanity-client.mjs',
      getContents: () =>
        [
          options.minimal
            ? genImport(join(runtimeDir, 'client'), ['createClient'])
            : genImport('@sanity/client', 'createClient'),
          'export { createClient }',
        ].join('\n'),
    })

    addAutoImport([
      { name: 'createClient', as: 'createSanityClient', from: '#build/sanity-client.mjs' },
      { name: 'groq', as: 'groq', from: join(runtimeDir, 'groq') },
      { name: 'useSanity', as: 'useSanity', from: join(runtimeDir, 'composables') },
      { name: 'useLazySanityQuery', as: 'useLazySanityQuery', from: join(runtimeDir, 'composables') },
      isNuxt3() && { name: 'useSanityQuery', as: 'useSanityQuery', from: join(runtimeDir, 'composables') },
    ].filter(Boolean))

    await addComponentsDir({
      path: join(runtimeDir, 'components'),
      extensions: ['js', 'ts', 'mjs'],
    })
  },
})
