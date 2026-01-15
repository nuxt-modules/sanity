import { describe, expectTypeOf, it } from 'vitest'
import type { Ref } from 'vue'
import { defineQuery } from 'groq'
import { useLazySanityQuery, useSanityQuery } from '#imports'

declare module '@sanity/client' {
  interface SanityQueries {
    '*[_type == "movie"][0]{title}': { title: string }
  }
}

describe('useSanityQuery type inference', () => {
  it('infers query result from a typed query string', () => {
    const query = defineQuery('*[_type == "movie"][0]{title}')
    const response = useSanityQuery(query)

    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })

  it('keeps backwards compatible generic typing', () => {
    const query = '*[_type == "movie"][0]{title}'
    const response = useSanityQuery<{ title: string }>(query)

    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })
})

describe('useLazySanityQuery type inference', () => {
  it('infers query result from a typed query string', () => {
    const query = defineQuery('*[_type == "movie"][0]{title}')
    const response = useLazySanityQuery(query)

    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })

  it('keeps backwards compatible generic typing', () => {
    const query = '*[_type == "movie"][0]{title}'
    const response = useLazySanityQuery<{ title: string }>(query)

    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })
})
