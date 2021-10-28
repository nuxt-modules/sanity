import { resolve } from 'path'
import { readdir, readFile } from 'fs-extra'

import { setupTest, getNuxt } from '@nuxt/test-utils'

const serverDeps = ['chalk', 'consola', 'fs-extra', 'upath']

describe('built files', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../../example',
    build: true,
  })

  it('should not include module requirements', async () => {
    const { options } = getNuxt()

    const clientDistDir = resolve(options.buildDir, './dist/client')

    const distContents = (await Promise.all((await readdir(clientDistDir))
      .map(file =>
        readFile(
          resolve(options.buildDir, './dist/client', file),
        ).toString(),
      )))
      .join('\n')

    serverDeps.forEach((dep) => {
      expect(distContents).not.toContain(dep)
    })
  })
})
