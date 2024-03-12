<template>
  <a
    v-if="shouldShow"
    :href="`/preview/disable?redirect=${route.fullPath}`"
    class="group fixed bottom-4 right-4 z-50 block rounded bg-white/30 px-3 py-2 text-center text-xs font-medium text-gray-800 shadow-lg backdrop-blur-md hover:bg-red-500 hover:text-white"
  >
    <span class="block group-hover:hidden">Preview Enabled</span>
    <span class="hidden group-hover:block">Disable Preview</span>
  </a>
</template>

<script setup lang="ts">
const route = useRoute()
const sanity = useSanity()

const shouldShow = computed(() => {
  const visualEditing = ('visualEditing' in sanity && sanity.visualEditing)

  // Only show the banner if preview mode is enabled and we are not in Presentation.
  // @ts-expect-error TODO: fix type testing within repo
  return visualEditing && visualEditing?.isPreviewing.value && !visualEditing.inFrame
})
</script>
