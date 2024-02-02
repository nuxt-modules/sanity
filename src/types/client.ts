import { createClient } from '#sanity-client'

export type SanityClient = ReturnType<typeof createClient>
