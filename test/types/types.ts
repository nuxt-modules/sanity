/// <reference types="../../playground/.nuxt/nuxt.d.ts" />

import { describe, expectTypeOf, it } from 'vitest'

describe('useSanityQuery', () => {
  it('should return typed response', () => {
    const response = useSanityQuery<{ title: string }>(`*[_type == "article"]{title}`)
    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })
})
