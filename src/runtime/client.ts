import type { createClient } from '#sanity-client'

export type SanityClient = ReturnType<typeof createClient>
export { createClient } from '#sanity-client'
export type { ClientConfig } from '#sanity-client'
