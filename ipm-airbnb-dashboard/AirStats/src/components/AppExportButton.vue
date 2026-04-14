<template>
  <div>
    <button
      @click="showOverlay = true"
      class="bg-orange text-white flex justify-evenly items-center font-medium rounded-2xl text-2xl w-45 py-3 ml-auto cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div>Exportar</div>
      <img src="../assets/exportIcon.svg" alt="Export" class="h-5" />
    </button>

    <AppExportOverlay :isOpen="showOverlay" @close="showOverlay = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppExportOverlay from './AppExportOverlay.vue'

const showOverlay = ref(false)
</script>
