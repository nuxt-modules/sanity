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
    </template>
    <template v-else>
      Loading ...
    </template>
    <NuxtLink
      to="/"
      class="rounded shadow-md bg-red-700 text-white px-4 py-2 my-2 inline-block"
      >Back</NuxtLink
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { groq } from '@nuxtjs/sanity'

const query = groq`*[_type == "movie" && slug.current == $slug][0] {
  title,
  releaseDate,
  castMembers[] {
    characterName
  }
}`

interface QueryResult {
  title: string
  releaseDate: string
  castMembers: Array<{ characterName: string }>
}

export default Vue.extend({
  async fetch() {
    const movieDetails = await this.$sanity.fetch<QueryResult>(query, {
      slug: this.$route.params.slug,
    })
    this.details = movieDetails
  },
  data: () => ({ details: null as null | QueryResult }),
})
</script>

