import type { SanityClient } from '@sanity/client'

import type { SanityModuleOptions, CONFIG_KEY } from './module'

import type { createClient } from './client'

const HELPER_KEY: `$${typeof CONFIG_KEY}` = '$sanity'

export * from './client'
export * from './helpers'

interface Client {
  client: SanityClient
  config: Pick<SanityModuleOptions, 'useCdn' | 'projectId' | 'dataset' | 'withCredentials' | 'token'>
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
  // eslint-disable-next-line
  interface Store<S> {
    [HELPER_KEY]: SanityHelper
  }
}
