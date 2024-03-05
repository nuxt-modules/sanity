// @ts-ignore
import { defineNuxtPlugin, useSanityVisualEditing } from '#imports'

export default defineNuxtPlugin(() => {
  useSanityVisualEditing()
  useSanityLiveMode()
})
