import { createCompatibilityActors, isMaybePresentation, isMaybePreviewWindow } from '@sanity/presentation-comlink'
import type { LoaderControllerMsg, LoaderNodeMsg } from '@sanity/presentation-comlink'
import { createNode, createNodeMachine } from '@sanity/comlink'
import { onScopeDispose } from 'vue'
import { defineNuxtPlugin } from '#imports'
import { useSanityPreviewEnvironment } from '../composables/useSanityPreviewEnvironment'
import { useSanityPerspective } from '../composables/useSanityPerspective'
import { useSanityConfig } from '../composables/useSanityConfig'
import { useSanityVisualEditingState } from '../composables/useSanityVisualEditingState'

/**
 * Detects and sets the preview environment information necessary for both
 * visual editing and Live Content API support
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const environment = useSanityPreviewEnvironment()

  if (isMaybePresentation()) {
    // Initialise comlink and attempt to determine the environment and
    // perspective reported by the Presentation Tool
    const timeout = setTimeout(() => {
      environment.value = 'live'
    }, 5_000)

    const comlink = createNode<LoaderNodeMsg, LoaderControllerMsg>(
      { name: 'loaders', connectTo: 'presentation' },
      createNodeMachine<LoaderNodeMsg, LoaderControllerMsg>().provide({
        actors: createCompatibilityActors<LoaderNodeMsg>(),
      }),
    )

    // Handle perspective messages: set the cookie with the new value
    const perspective = useSanityPerspective()
    comlink.on('loader/perspective', (data) => {
      if (perspective.value !== data.perspective) {
        perspective.value = data.perspective
      }
    })

    // If and when comlink connects, we can determine the environment
    comlink.onStatus(() => {
      clearTimeout(timeout)
      environment.value = isMaybePreviewWindow() ? 'presentation-window' : 'presentation-iframe'
    }, 'connected')

    comlink.start()
    onScopeDispose(comlink.stop)
  }
  // Likely outside of Presentation Tool, use visual editing and live content
  // configuration to determine the environment
  else {
    const visualEditingEnabled = useSanityVisualEditingState()?.enabled
    const hasLiveContentBrowserToken = !!useSanityConfig().liveContent?.browserToken

    if (visualEditingEnabled && hasLiveContentBrowserToken) {
      environment.value = 'live'
    }
    else if (visualEditingEnabled) {
      environment.value = 'static'
    }
    else {
      environment.value = 'unknown'
    }
  }
})
