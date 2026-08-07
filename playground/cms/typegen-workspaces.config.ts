import { defineConfig } from 'sanity'

export default defineConfig([
  {
    name: 'first',
    basePath: '/first',
    projectId: 'typegen-test',
    dataset: 'production',
    schema: {
      types: [{ name: 'firstDocument', type: 'document', fields: [] }],
    },
  },
  {
    name: 'second',
    basePath: '/second',
    projectId: 'typegen-test',
    dataset: 'production',
    schema: {
      types: [{ name: 'secondDocument', type: 'document', fields: [] }],
    },
  },
])
