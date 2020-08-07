import { resolve } from 'path'

import { bold } from 'chalk'
import consola from 'consola'
import defu from 'defu'

import { Module } from '@nuxt/types'

import { SanityClient } from '@sanity/client'
import { SanityConfiguration, createClient } from './client'

export interface ModuleOptions extends Partial<SanityConfiguration> {
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
}
const DEFAULTS: ModuleOptions = {
  imageHelper: true,
}
const CONFIG_KEY = 'sanity'

function validateConfig({ projectId, dataset }: ModuleOptions) {
  if (!projectId) {
    consola.warn(
      `Make sure you specify a ${bold('projectId')} in your sanity config.`
    )
    return false
  } else {
    consola.info(
      `Enabled ${bold('@nuxtjs/sanity')} for project ${bold(projectId)} (${bold(
        dataset
      )}).`
    )
    return true
  }
}

const nuxtModule: Module<ModuleOptions> = function(moduleOptions) {
  let sanityConfig: Record<string, any> = {}

  try {
    // eslint-disable-next-line
    const { projectId, dataset } = require(resolve(
      this.options.rootDir,
      './sanity.json'
    )).api
    sanityConfig = { projectId, dataset }
  } catch {}

  const options = defu<ModuleOptions>(
    this.options[CONFIG_KEY],
    moduleOptions,
    sanityConfig,
    DEFAULTS
  )

  if (!validateConfig(options)) return

  let useOfficialClient = !options.minimal
  try {
    require('@sanity/client')
  } catch {
    useOfficialClient = false
    consola.warn(
      `Not using ${bold(
        '@sanity/client'
      )} as it cannot be resolved in your project dependencies.
       Try running ${bold('yarn add @sanity/client')} or ${bold(
        'npm install @sanity/client'
      )}.`
    )
  }

  const { dst } = this.addTemplate({
    src: resolve(__dirname, '../templates/plugin.js'),
    fileName: 'sanity/plugin.js',
    options: {
      client: useOfficialClient,
      sanityConfig: JSON.stringify({
        useCdn: options.useCdn,
        projectId: options.projectId,
        dataset: options.dataset,
        withCredentials: options.withCredentials,
        token: options.token,
      }),
    },
  })

  this.options.plugins = this.options.plugins || []
  this.options.plugins.push(resolve(this.options.buildDir || '', dst))

  if (options.imageHelper) {
    const { dst: imageDst } = this.addTemplate({
      src: resolve(__dirname, '../templates/sanity-image.js'),
      fileName: 'sanity/sanity-image.js',
      options: {
        projectId: options.projectId,
        dataset: options.dataset,
      },
    })
    this.options.plugins.push(resolve(this.options.buildDir || '', imageDst))
  }

  this.options.build.transpile = this.options.build.transpile || []
  this.options.build.transpile.push(/^@nuxtjs[\\/]sanity/)
}
;(nuxtModule as any).meta = require('../package.json')

declare module '@nuxt/types' {
  interface NuxtConfig {
    sanity: ModuleOptions
  } // Nuxt 2.14+
  interface Configuration {
    sanity: ModuleOptions
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
