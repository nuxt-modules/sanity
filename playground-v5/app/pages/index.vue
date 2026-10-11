<template>
  <div>
    <h2>Project ID: {{ $sanity.config.projectId }}</h2>
    <NuxtLink
      v-for="(movie, index) in movies"
      :key="movie.title ?? index"
      :to="`/movie/${movie.slug}`"
    >
      {{ movie.title }}
      <SanityImage
        :asset-id="movie.poster ?? undefined"
        w="128"
        auto="format"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const moviesQuery = groq`*[_type == "movie"] {
  title,
  "poster": poster.asset._ref,
  "slug": slug.current
}`

const { data } = await useSanityQuery<Array<{ title?: string, poster?: string, slug?: string }>>(moviesQuery)

const movies = computed(() => (data.value || []).sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')))
</script>
