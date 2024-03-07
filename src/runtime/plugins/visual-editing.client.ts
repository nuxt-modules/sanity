// @ts-expect-error need correct typing of #imports
import { defineNuxtPlugin, useRuntimeConfig, useSanityVisualEditing, useSanityLiveMode } from '#imports'

export default defineNuxtPlugin(() => {
  const $config = useRuntimeConfig();
  const { visualEditing } = $config.public.sanity;

  if (
    visualEditing?.mode === 'live-visual-editing' ||
    visualEditing?.mode === 'visual-editing'
  ) {
    useSanityVisualEditing({
      refresh: visualEditing?.refresh,
      zIndex: visualEditing?.zIndex,
    });
  }

  if (visualEditing?.mode === 'live-visual-editing') {
    useSanityLiveMode();
  }
});
