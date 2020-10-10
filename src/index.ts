import { resolve } from 'path'

import defu from 'defu'

import type { Module } from '@nuxt/types'
import type { SanityClient } from '@sanity/client'

import { SanityConfiguration, createClient } from './client'

const isNuxtBuild = process.client || process.server

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
   * Configuration for any additional clients
   */
  additionalClients?: Record<string, Partial<SanityConfiguration>>
}
const isProd = process.env.NODE_ENV === 'production'

const DEFAULTS: SanityModuleOptions = {
  contentHelper: true,
  imageHelper: true,
  dataset: 'production',
  withCredentials: false,
}
const CONFIG_KEY = 'sanity'
const HELPER_KEY = '$sanity'

function validateConfig ({ projectId, dataset }: SanityModuleOptions) {
  if (isNuxtBuild) return

  const { bold }: typeof import('chalk') = process.client ? {} : require('chalk')
  const consola: typeof import('consola').default = process.client ? {} : require('consola')

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

const nuxtModule: Module<SanityModuleOptions> = function (moduleOptions) {
  if (isNuxtBuild) return

  const { bold }: typeof import('chalk') = process.client ? {} : require('chalk')
  const consola: typeof import('consola').default = process.client ? {} : require('consola')

  let sanityConfig: Record<string, any> = {}

  try {
    // eslint-disable-next-line
    const fs: typeof import('fs-extra') = process.client ? {} : require('fs-extra')
    const { projectId, dataset } = fs.readJSONSync(
      resolve(this.options.rootDir, './sanity.json'),
    ).api
    sanityConfig = { projectId, dataset }
  } catch {}

  const options = defu<SanityModuleOptions>(
    this.options[CONFIG_KEY],
    moduleOptions,
    sanityConfig,
    { useCdn: isProd && !moduleOptions.token && !this.options[CONFIG_KEY].token },
    DEFAULTS,
  )

  if (!validateConfig(options)) {
    return
  }

  let useOfficialClient = !options.minimal
  try {
    if (useOfficialClient) {
      useOfficialClient = !!((process.client || process.server) ? require.resolveWeak('@sanity/client') : require('@sanity/client'))
    }
  } catch {
    useOfficialClient = false
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

  this.addPlugin({
    src: resolve(__dirname, '../templates/plugin.js'),
    fileName: 'sanity/plugin.js',
    options: {
      client: useOfficialClient,
      components: {
        imageHelper: options.imageHelper,
        contentHelper: options.contentHelper,
      },
      sanityConfig: JSON.stringify({
        useCdn: options.useCdn,
        projectId: options.projectId,
        dataset: options.dataset,
        withCredentials: options.withCredentials,
        token: options.token,
      }),
      additionalClients: JSON.stringify(options.additionalClients || {}),
    },
  })

  if (options.imageHelper) {
    this.addTemplate({
      src: resolve(__dirname, '../dist/sanity-image.js'),
      fileName: 'sanity/sanity-image.js',
      options: {
        projectId: options.projectId,
        dataset: options.dataset,
      },
    })
  }

  this.options.build.transpile = this.options.build.transpile || []
  this.options.build.transpile.push(/^@nuxtjs[\\/]sanity/)
}
;(nuxtModule as any).meta = { name: '@nuxtjs/sanity' }

interface Client {
  client: SanityClient
  fetch: ReturnType<typeof createClient>['fetch']
  setToken: (token: string) => void
}

type SanityHelper = Record<string, Client> & Client

declare module '@nuxt/types' {
  interface NuxtOptions {
    [CONFIG_KEY]: SanityModuleOptions
  } // Nuxt 2.14+
  interface Configuration {
    [CONFIG_KEY]: SanityModuleOptions
  } // Nuxt 2.9 - 2.13
  interface NuxtAppOptions {
    [HELPER_KEY]: SanityHelper
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    [HELPER_KEY]: SanityHelper
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    [HELPER_KEY]: SanityHelper
  }
}

export * from './client'
export * from './helpers'

export default nuxtModule
