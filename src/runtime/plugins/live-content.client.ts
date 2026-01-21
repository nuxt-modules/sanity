import { createCompatibilityActors, isMaybePresentation, isMaybePreviewWindow } from '@sanity/presentation-comlink'
import type { LoaderControllerMsg, LoaderNodeMsg } from '@sanity/presentation-comlink'
import { createNode, createNodeMachine } from '@sanity/comlink'
import { onScopeDispose, watch } from 'vue'
import { defineNuxtPlugin, refreshNuxtData } from '#imports'
import { useSanityConfig } from '../composables/useSanityConfig'
import { useSanityVisualEditingState } from '../composables/useSanityVisualEditingState'
import { useSanity } from '../composables/useSanity'
import { useIsSanityPresentationTool } from '../composables/useIsSanityPresentationTool'
import { useSanityPreviewEnvironment } from '../composables/useSanityPreviewEnvironment'
import { useSanityPerspective } from '../composables/useSanityPerspective'

export default defineNuxtPlugin(() => {
  const { liveContent, visualEditing } = useSanityConfig()
  if (!import.meta.client || !liveContent) return
  const visualEditingState = useSanityVisualEditingState()
  const sanity = useSanity()

  const { browserToken } = liveContent

  const liveClient = sanity.client.withConfig({
    ignoreBrowserTokenWarning: true,
    token: browserToken,
    useCdn: false,
  })

  const includeDrafts = !!(browserToken && visualEditingState?.enabled)
  const tag = 'nuxt-loader.live'

  /**
   * 1. Initialise a method for handling live events
   */
  const _inPresentation = useIsSanityPresentationTool()
  watch(_inPresentation, (inPresentation, _wasInPresentation, onCleanup) => {
    if (
      inPresentation === false
      || (inPresentation === true && visualEditing?.mode !== 'live-visual-editing')) {
      const { unsubscribe } = liveClient.live.events({ includeDrafts, tag }).subscribe({
        next: (event) => {
          if (import.meta.dev && event.type === 'welcome') {
            console.info(
              'Sanity is live with',
              (typeof browserToken === 'string' && visualEditingState?.enabled ? browserToken : undefined)
                ? 'automatic revalidation for draft content changes as well as published content'
                : visualEditingState?.enabled
                  ? 'automatic revalidation for only published content. Provide a `browserToken` to `defineLive` to support draft content outside of Presentation Tool.'
                  : 'automatic revalidation of published content',
            )
          }
          else if (event.type === 'message') {
            const tags = event.tags.map(tag => `sanity:${tag}`)
            sanity.liveStore?.notify(tags, event.id)
          }
          else if (event.type === 'restart') {
            refreshNuxtData()
            // @todo or reloadNuxtApp()?
          }
        },
        error: () => {
          console.error('Live event error')
        },
      })
      onCleanup(() => {
        unsubscribe()
      })
    }
  }, { immediate: true })

  /**
   * 2. Set the environment when (maybe) outside of Presentation
   */
  const environment = useSanityPreviewEnvironment()

  // If we're not in Presentation Tool, detect which environment we're in
  if (!isMaybePresentation()) {
    if (visualEditingState?.enabled && browserToken) {
      environment.value = 'live'
    }
    else if (visualEditingState?.enabled) {
      environment.value = 'static'
    }
    else {
      environment.value = 'unknown'
    }
  }

  /**
   * 3. If we are (maybe) in Presentation Tool, initialise comlink and attempt to determine the environment and perspective
   */
  if (isMaybePresentation()) {
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
    comlink.on('loader/perspective', (data) => {
      const perspective = useSanityPerspective()
      if (perspective.value !== data.perspective) {
        perspective.value = data.perspective
      }
    })

    // When comlink connects, we can determine the environment
    comlink.onStatus(() => {
      clearTimeout(timeout)
      environment.value = isMaybePreviewWindow() ? 'presentation-window' : 'presentation-iframe'
    }, 'connected')

    comlink.start()
    onScopeDispose(comlink.stop)
  }

  /**
   * 4. Handle refreshing
   */
  const focusThrottleInterval = 5_000
  let nextFocusRevalidatedAt = 0
  const callback = () => {
    const now = Date.now()
    if (now > nextFocusRevalidatedAt && document.visibilityState !== 'hidden') {
      refreshNuxtData()
      nextFocusRevalidatedAt = now + focusThrottleInterval
    }
  }
  document.addEventListener('visibilitychange', callback, { passive: true })
  window.addEventListener('focus', callback, { passive: true })
})
