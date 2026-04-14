<template>
  <div
    class="relative bg-light-gray opacity-70 rounded-xl p-4 flex flex-col gap-2 shadow-md w-full text-center"
  >
    <button @click="show = true" class="absolute top-2 right-2 cursor-pointer">
      <img src="../assets/infoIcon.svg" alt="Info" class="h-5 invert brightness-0" />
    </button>

    <div class="text-5xl font-bold text-white tracking-wide place-self-start">
      {{ formattedData }}
    </div>

    <div class="text-white font-medium text-xl mt-1 place-self-end">
      {{ name }}
    </div>

    <div
      v-if="show"
      class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl z-10 p-4"
    >
      <div class="relative w-full h-full flex flex-col items-center justify-evenly">
        <div class="flex items-center w-full justify-between">
          <h2 class="text-lg font-semibold text-dark-gray self-start">{{ name }}</h2>
          <button
            class="text-xl text-light-gray absolute top-2 right-2 cursor-pointer"
            @click="show = false"
          >
            <svg class="w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-sm text-left text-dark-gray">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  name: string
  data: number | null
  description: string
}

const props = defineProps<Props>()
const show = ref(false)

const formattedData = computed(() => {
  if (props.data === null || props.data === undefined) return '—'
  return props.data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})
</script>
