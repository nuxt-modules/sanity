import { defineConfig, definePlugin } from 'sanity'

const firstPlugin = definePlugin({
  name: 'first-plugin',
  schema: {
    types: [{ name: 'firstPluginString', type: 'string' }],
  },
})

const secondPlugin = definePlugin({
  name: 'second-plugin',
  schema: {
    types: [{ name: 'secondPluginString', type: 'string' }],
  },
})

export default defineConfig([
  {
    name: 'first',
    basePath: '/first',
    projectId: 'typegen-test',
    dataset: 'production',
    plugins: [firstPlugin()],
    schema: {
      types: [{ name: 'firstDocument', type: 'document', fields: [] }],
    },
  },
  {
    name: 'second',
    basePath: '/second',
    projectId: 'typegen-test',
    dataset: 'production',
    plugins: [secondPlugin()],
    schema: {
      types: [{ name: 'secondDocument', type: 'document', fields: [] }],
    },
  },
])
