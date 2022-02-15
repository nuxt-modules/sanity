<template>
  <div>A custom component: {{ someProp }}</div>
</template>

<script setup>
defineProps({
  someProp: String,
})
</script>
