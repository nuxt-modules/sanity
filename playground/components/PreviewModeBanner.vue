<template>
  <ClientOnly>
    <Component
      :is="showDisable ? 'a' : 'div'"
      :href="showDisable ? `/preview/disable?redirect=${route.fullPath}` : null"
      class="group fixed bottom-4 right-4 z-50 block rounded bg-white/30 px-3 py-2 text-left text-xs text-gray-800 shadow-lg backdrop-blur-md"
      :class="showDisable ? 'hover:bg-red-500 hover:text-white' : ''"
    >
      <div
        v-if="showDisable"
        class="font-bold"
      >
        <span class="block group-hover:hidden">Preview Enabled</span>
        <span class="hidden group-hover:block">Disable Preview</span>
      </div>
      <div>Environment: {{ environment }}</div>
      <div>Perspective: {{ perspective }}</div>
    </Component>
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const environment = useSanityPreviewEnvironment()
const perspective = useSanityPreviewPerspective()
const isSanityPresentationTool = useIsSanityPresentationTool()

const showDisable = computed(() => isSanityPresentationTool.value === false)
</script>
