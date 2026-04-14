<script setup lang="ts">
import { RouterView } from 'vue-router'
import './style.css'
</script>

<template>
  <RouterView :key="$route.fullPath" />
</template>

<script lang="ts">
export default {
  name: 'App',
  components: {
    RouterView,
  },
}
</script>
