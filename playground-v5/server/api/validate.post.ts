import { defineEventHandler, readBody } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const { query } = await readBody<{ query: string }>(event)
  const valid = await validateSanityQuery(query, {
    filter: {
      include: ['app/pages/**'],
    },
  })
  const queries = await getSanityGroqQueries()
  return { valid, files: queries.map(q => q.filepath) }
})
