import { PackageOptions } from 'siroc'

const config: PackageOptions = {
  rollup: {
    externals: ['chalk', 'consola', 'defu', 'fs-extra'],
  },
}

export default config
