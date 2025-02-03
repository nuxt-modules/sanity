<template>
  <div
    class="bg-gray-300 grid grid-flow-row grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-8 overflow-x-hidden min-h-screen"
  >
    <h2>Project ID: {{ $sanity.config.projectId }}</h2>
    <NuxtLink
      v-for="({ title, poster, slug }) in movies"
      :key="title"
      :to="`/movie/${slug}`"
      class="flex h-48 relative justify-start"
    >
      <div
        class="py-2 px-4 left-0 bottom-0 mb-4 flex-grow absolute bg-gray-100 rounded shadow-md font-semibold text-gray-800"
      >
        {{ title }}
      </div>

      <SanityImage
        class="object-contain w-48"
        :asset-id="poster"
        w="128"
        auto="format"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const query = groq`*[_type == "movie"] {
  title,
  "poster": poster.asset._ref,
  "slug": slug.current
}`

interface QueryResult {
  title: string
  poster: string
  slug: string
}

const { data } = await useSanityQuery<QueryResult[]>(query)

const movies = computed(() => (data.value || []).sort((a, b) => a.title.localeCompare(b.title)))
</script>
