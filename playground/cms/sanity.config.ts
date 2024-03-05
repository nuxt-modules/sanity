import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { debugSecrets } from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'

export default defineConfig({
  name: 'default',

  projectId: 'j1o4tmjp',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: 'http://localhost:3000',
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable',
        },
      },
    }),
    debugSecrets(),
  ],

  schema: {
    types: schemaTypes,
  },
})
