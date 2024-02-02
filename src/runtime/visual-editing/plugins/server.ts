import {
  defineNuxtPlugin,
  useRuntimeConfig,
  useState,
  useCookie,
} from '#imports'

export default defineNuxtPlugin(() => {
  const enabled = useState('_sanity_visualEditing', () => false)

  const $config = useRuntimeConfig()

  const { visualEditing } = $config.sanity

  if (visualEditing?.draftMode) {
    const draftModeCookie = useCookie('__sanity_draft')
    enabled.value = draftModeCookie.value === visualEditing.draftModeId
  } else if (typeof visualEditing === 'object' && !visualEditing.draftMode) {
    enabled.value = true
  }
})
