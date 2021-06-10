import { defineNuxtModule, addPlugin } from '@nuxt/kit'

import { bold } from 'chalk'
import consola from 'consola'
import { readJSONSync } from 'fs-extra'
import { join, resolve } from 'upath'

import { name } from '../package.json'

import type { SanityConfiguration } from '.'

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

export const CONFIG_KEY = 'sanity' as const

function validateConfig ({ projectId, dataset }: SanityModuleOptions) {
  if (!projectId) {
    consola.warn(
      `Make sure you specify a ${bold('projectId')} in your sanity config.`,
    )
    return false
  } else {
    consola.info(
      `Enabled ${bold('@nuxtjs/sanity')} for project ${bold(projectId)} (${bold(
        dataset,
      )}).`,
    )
    return true
  }
}

function getDefaultSanityConfig (jsonPath: string) {
  try {
    const { projectId, dataset } = readJSONSync(jsonPath).api
    return { projectId, dataset }
  } catch {
    return {}
  }
}

export default defineNuxtModule<SanityModuleOptions>(nuxt => ({
  name,
  configKey: 'sanity',
  defaults: {
    contentHelper: true,
    imageHelper: true,
    dataset: 'production',
    apiVersion: '1',
    withCredentials: false,
    additionalClients: {},
    ...getDefaultSanityConfig(resolve(nuxt.options.rootDir, './sanity.json')),
  },
  setup (options, nuxt) {
    if (!('useCdn' in options)) {
      options.useCdn = process.env.NODE_ENV === 'production' && !options.token
    }

    if (!validateConfig(options)) return

    try {
      if (!options.minimal) {
        // TODO: This will fail in Nuxt 3
        options.minimal = !(nuxt as any).resolver.requireModule('@sanity/client')
      }
    } catch {
      options.minimal = true
      consola.warn(
      `Not using ${bold(
        '@sanity/client',
      )} as it cannot be resolved in your project dependencies.
       Try running ${bold('yarn add @sanity/client')} or ${bold(
        'npm install @sanity/client',
      )}.
       To disable this warning, set ${bold(
         'sanity: { minimal: true }',
       )} in your nuxt.config.js.`,
      )
    }

    nuxt.options[CONFIG_KEY] = options
    const autoregister = !!nuxt.options.components

    addPlugin({
      src: resolve(__dirname, '../templates/plugin.js'),
      fileName: 'sanity/plugin.js',
      options: {
        client: !options.minimal,
        components: {
          autoregister,
          imageHelper: options.imageHelper,
          contentHelper: options.contentHelper,
        },
        sanityConfig: JSON.stringify({
          useCdn: options.useCdn,
          projectId: options.projectId,
          dataset: options.dataset,
          apiVersion: options.apiVersion,
          withCredentials: options.withCredentials,
          token: options.token,
        }),
        additionalClients: JSON.stringify(options.additionalClients),
      },
    })

    if (autoregister) {
      nuxt.hook('components:dirs', (dirs: Array<{ path: string, extensions?: string[] }>) => {
        dirs.push({
          path: join(__dirname, 'components'),
          extensions: ['js'],
        })
      })
    }

    nuxt.options.build.transpile = nuxt.options.build.transpile || /* istanbul ignore next */[]
    nuxt.options.build.transpile.push(/^@nuxtjs[\\/]sanity/)
  },
}),
)
