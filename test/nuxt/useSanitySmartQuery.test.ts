/// <reference types="../../playground/.nuxt/nuxt.d.ts" />

import { describe, expectTypeOf, it } from 'vitest'
import type { Ref } from 'vue'
import { useSanitySmartQuery } from '#imports'

describe('useSanitySmartQuery', () => {
  it('should return typed response matching useSanityQuery signature', () => {
    const response = useSanitySmartQuery<{ title: string }>(`*[_type == "article"]{title}`)
    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })

  it('should accept query params', () => {
    const response = useSanitySmartQuery<{ title: string }>(
      `*[_type == "article" && topic == $topic]{title}`,
      { topic: 'news' },
    )
    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })

  it('should accept options matching UseSanityQueryOptions', () => {
    const response = useSanitySmartQuery<{ title: string }>(
      `*[_type == "article"]{title}`,
      {},
      { lazy: false },
    )
    expectTypeOf(response.data).toEqualTypeOf<Ref<{ title: string } | null>>()
  })
})
