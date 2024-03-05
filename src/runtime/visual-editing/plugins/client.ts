// @ts-ignore
import { defineNuxtPlugin, useSanityVisualEditing, useSanityLiveMode } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  useSanityVisualEditing()
  if(nuxtApp.$config.public.sanity.visualEditing?.mode !== 'basic') {
    useSanityLiveMode()
  }
})
