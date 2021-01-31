import { resolve } from 'path'
import { readdirSync, readFileSync } from 'fs-extra'

import { setupTest, getNuxt } from '@nuxt/test-utils'

const serverDeps = ['chalk', 'consola', 'fs-extra', 'upath']

describe('built files', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    build: true,
  })

  it('should not include module requirements', () => {
    const { options } = getNuxt()

    const clientDistDir = resolve(options.buildDir, './dist/client')

    const distContents = readdirSync(clientDistDir)
      .map(file =>
        readFileSync(
          resolve(options.buildDir, './dist/client', file),
        ).toString(),
      )
      .join('\n')

    serverDeps.forEach((dep) => {
      expect(distContents).not.toContain(dep)
    })
  })
})
