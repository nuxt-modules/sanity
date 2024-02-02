import { deskTool } from 'sanity/desk'
import { presentationTool } from 'sanity/presentation'
import { createConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { debugSecrets } from '@sanity/preview-url-secret/sanity-plugin-debug-secrets'

export default createConfig({
  name: 'default',

  projectId: 'j1o4tmjp',
  dataset: 'production',

  plugins: [
    deskTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: 'http://localhost:3000',
        draftMode: {
          enable: '/draft/enable',
          disable: '/draft/disable',
        },
      },
    }),
    debugSecrets(),
  ],

  schema: {
    types: schemaTypes,
  },
})
