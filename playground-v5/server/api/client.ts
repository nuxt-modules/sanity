import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => useSanity().config)
