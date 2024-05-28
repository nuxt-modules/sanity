import { defineType } from 'sanity'

export default defineType({
  title: 'Plot summaries',
  name: 'plotSummaries',
  type: 'object',
  fields: [
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'summaries',
      title: 'Summaries',
      type: 'array',
      of: [{ type: 'plotSummary' }],
    },
  ],
})
