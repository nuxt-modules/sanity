import { resolve } from 'path'

import { bold } from 'chalk'
import consola from 'consola'
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
}
const isProd = process.env.NODE_ENV === 'production'

const DEFAULTS: SanityModuleOptions = {
  contentHelper: true,
  imageHelper: true,
  dataset: 'production',
  withCredentials: false,
}
const CONFIG_KEY = 'sanity'

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

const nuxtModule: Module<SanityModuleOptions> = function (moduleOptions) {
  if (isNuxtBuild) {
    return
  }

  let sanityConfig: Record<string, any> = {}

  try {
    // eslint-disable-next-line
    if (process.server) {
      const fs = require('fs-extra')
      const { projectId, dataset } = fs.readJSONSync(
        resolve(this.options.rootDir, './sanity.json'),
      ).api
      sanityConfig = { projectId, dataset }
    }
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
      useOfficialClient = !!require.resolveWeak('@sanity/client')
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

declare module '@nuxt/types' {
  interface NuxtConfig {
    sanity: SanityModuleOptions
  } // Nuxt 2.14+
  interface Configuration {
    sanity: SanityModuleOptions
  } // Nuxt 2.9 - 2.13
  interface NuxtAppOptions {
    $sanity: {
      client: SanityClient
      fetch: ReturnType<typeof createClient>['fetch']
      setToken: (token: string) => void
    }
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $sanity: {
      client: SanityClient
      fetch: ReturnType<typeof createClient>['fetch']
      setToken: (token: string) => void
    }
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $sanity: {
      client: SanityClient
      fetch: ReturnType<typeof createClient>['fetch']
      setToken: (token: string) => void
    }
  }
}

export * from './client'
export * from './helpers'

export default nuxtModule
