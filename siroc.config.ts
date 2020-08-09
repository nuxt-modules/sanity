import { resolve } from 'path'
import { readdirSync } from 'fs-extra'

import type { PackageOptions } from 'siroc'
import type { RollupOptions } from 'rollup'

import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const components = readdirSync('./src/components')
const externals = ['chalk', 'consola', 'defu', 'fs-extra']

const config: PackageOptions = {
  rollup: {
    externals,
  },
  hooks: {
    'build:extendRollup' (_pkg, { rollupConfig }) {
      const config = components.map((filename): RollupOptions[] => {
        const base = filename.split('.').slice(0, -1).join('.')
        return [{
          input: resolve(`./src/components/${filename}`),
          output: {
            file: resolve(`./dist/${base}.js`),
            format: 'es',
          },
          external: externals,
          plugins: [
            esbuild(),
          ],
        },
        {
          input: resolve(`./src/components/${filename}`),
          output: {
            file: resolve(`./dist/${base}.d.ts`),
            format: 'es',
          },
          external: externals,
          plugins: [
            dts(),
          ],
        }]
      }).flat()

      rollupConfig.push(...config)
    },
  },
}

export default config
