<template>
  <div>
    <template v-if="details">
      <p><strong>Title</strong>: {{ details.title }}</p>
      <ul>
        <li
          v-for="({ characterName }, index) in details.castMembers"
          :key="characterName ?? index"
        >
          {{ characterName }}
        </li>
      </ul>
      <SanityContent
        v-if="details.overview"
        :value="details.overview"
      />
    </template>
    <NuxtLink to="/">
      Back
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const movieBySlugQuery = groq`*[_type == "movie" && slug.current == $slug][0] {
  title,
  castMembers[] {
    characterName
  },
  overview
}`

const route = useRoute()
const { data: details } = await useSanityQuery<{
  title?: string
  castMembers?: Array<{ characterName?: string }>
  overview?: any[]
}>(movieBySlugQuery, {
  slug: route.params.slug,
})
</script>
