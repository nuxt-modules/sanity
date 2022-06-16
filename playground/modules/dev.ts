import { defineNuxtModule } from '@nuxt/kit'

// This module is a POC for a possible module to assist other modules in developing
// Nuxt modules (or alternatively to build similar features into Nuxt or nuxt-module-builder).

export default defineNuxtModule({
  meta: {
    name: 'module-dev',
  },
  setup (_options, nuxt) {
    nuxt.options.typescript.typeCheck = true
    // resolve aliases in tsconfig
    nuxt.hook('prepare:types', ({ tsConfig }) => {
      tsConfig.compilerOptions.paths = Object.fromEntries(Object.entries(tsConfig.compilerOptions.paths).map(([alias, _paths]) => {
        const paths = (_paths as string[])
          .map(path => path.replace(/node_modules\/\.pnpm\/nuxt3?@[^/]+\/node_modules\/nuxt3?/, 'node_modules/nuxt'))
        return [alias, paths]
      }))
    })
  },
})
