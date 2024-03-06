import { defineNuxtPlugin, useRuntimeConfig, useState, useCookie } from '#imports'

export default defineNuxtPlugin(() => {
  const enabled = useState('_sanity_visualEditing', () => false)

  const $config = useRuntimeConfig()
  const { visualEditing } = $config.sanity

  if (visualEditing?.previewMode) {
    const previewModeCookie = useCookie('__sanity_preview')
    enabled.value = previewModeCookie.value === visualEditing.previewModeId
  } else if (typeof visualEditing === 'object' && !visualEditing.previewMode) {
    enabled.value = true
  }
})
