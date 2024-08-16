<template>
  <div>{{ movies }}</div>
</template>

<script setup lang="ts">
const { data: movies } = await useFetch('/api/groq')
</script>
