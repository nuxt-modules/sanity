import { defineConfig } from 'sanity'
import { typegenTestPlugin } from './typegen-test-plugin'

export default defineConfig({
  name: 'default',
  projectId: 'typegen-test',
  dataset: 'production',
  plugins: [typegenTestPlugin()],
  schema: {
    types: [
      {
        name: 'pluginDocument',
        type: 'document',
        fields: [
          {
            name: 'pluginField',
            type: 'pluginString',
          },
        ],
      },
    ],
  },
})
