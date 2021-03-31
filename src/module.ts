import { bold } from 'chalk'
import consola from 'consola'
import defu from 'defu'
import { readJSONSync } from 'fs-extra'
import { join, resolve } from 'upath'

import type { Module } from '@nuxt/types'

import { name, version } from '../package.json'

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
const isProd = process.env.NODE_ENV === 'production'

const DEFAULTS: SanityModuleOptions = {
  contentHelper: true,
  imageHelper: true,
  dataset: 'production',
  apiVersion: '1',
  withCredentials: false,
  additionalClients: {},
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

const sanityModule: Module<SanityModuleOptions> = function sanityModule (moduleOptions) {
  let sanityConfig: Record<string, any> = {}

  try {
    const { projectId, dataset } = readJSONSync(
      resolve(this.options.rootDir, './sanity.json'),
    ).api
    sanityConfig = { projectId, dataset }
  } catch {}

  const options = defu(
    this.options[CONFIG_KEY],
    moduleOptions,
    sanityConfig,
    { useCdn: /* istanbul ignore next */ isProd && !moduleOptions.token && (!this.options[CONFIG_KEY] || !this.options[CONFIG_KEY].token) },
    DEFAULTS,
  )

  if (!validateConfig(options)) {
    return
  }

  try {
    if (!options.minimal) {
      options.minimal = !this.nuxt.resolver.requireModule('@sanity/client')
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

  this.options[CONFIG_KEY] = options
  const autoregister = !!this.options.components

  this.addPlugin({
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
    this.nuxt.hook('components:dirs', (dirs: Array<{ path: string, extensions?: string[] }>) => {
      dirs.push({
        path: join(__dirname, 'components'),
        extensions: ['js'],
      })
    })
  }

  this.options.build.transpile = this.options.build.transpile || /* istanbul ignore next */ []
  this.options.build.transpile.push(/^@nuxtjs[\\/]sanity/)
}

;(sanityModule as any).meta = { name, version }

export default sanityModule
