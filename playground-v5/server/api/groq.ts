import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => groq`hey there!`)
