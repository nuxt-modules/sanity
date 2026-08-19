import { definePlugin } from 'sanity'

export const typegenTestPlugin = definePlugin({
  name: 'typegen-test-plugin',
  schema: {
    types: [
      {
        name: 'pluginString',
        type: 'string',
      },
    ],
  },
})
