// @ts-ignore
import { defineNuxtPlugin, useSanityVisualEditing } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  useSanityVisualEditing()
  if(nuxtApp.$config.public.sanity.visualEditing?.mode !== 'basic') {
    useSanityLiveMode()
  }
})
