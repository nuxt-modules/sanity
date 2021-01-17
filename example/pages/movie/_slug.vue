<template>
  <div class="p-4">
    <template v-if="details">
      <p><strong>Title</strong>: {{ details.title }}</p>
      <p>
        <strong>Release date</strong>:
        {{
          new Date(details.releaseDate).toLocaleDateString('en-GB', {
            month: 'numeric',
            day: 'numeric',
          })
        }}
      </p>
      <ul class="mt-4">
        <li
          v-for="{ characterName } in details.castMembers"
          :key="characterName"
        >
          {{ characterName }}
        </li>
      </ul>
      <LocalSanityImage class="w-6 h-12" project-id="j1o4tmjp" asset-id="image-e22a88d23751a84df81f03ef287ae85fc992fe12-780x1170-jpg" />
      <SanityContent :blocks="details.overview" />
    </template>
    <template v-else>
      Loading ...
    </template>
    <NuxtLink
      to="/"
      class="rounded shadow-md bg-red-700 text-white px-4 py-2 my-2 inline-block"
    >
      Back
    </NuxtLink>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { groq } from '@nuxtjs/sanity'
import { SanityImage } from '@nuxtjs/sanity/sanity-image'

const query = groq`*[_type == "movie" && slug.current == $slug][0] {
  title,
  releaseDate,
  castMembers[] {
    characterName
  },
  overview
}`

interface QueryResult {
  title: string
  releaseDate: string
  castMembers: Array<{ characterName: string }>
  overview: any[]
}

export default Vue.extend({
  components: {
    LocalSanityImage: SanityImage,
  },
  data: () => ({ details: null as null | QueryResult }),
  async fetch () {
    const movieDetails = await this.$sanity.another.fetch<QueryResult>(query, {
      slug: this.$route.params.slug,
    })
    this.details = movieDetails
  },
})
</script>
