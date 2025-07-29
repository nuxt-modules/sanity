import defu from 'defu'
import type { SanityResolvedConfig, SanityRuntimeConfig } from '../types'
import { useRuntimeConfig } from '#imports'

export const useSanityConfig = () => {
  const $config = useRuntimeConfig()

  return defu(
    (import.meta.server ? $config.sanity : {}) as Partial<SanityRuntimeConfig>,
    $config.public.sanity,
  ) as SanityResolvedConfig
}
