<template>
    <div 
      class="rounded-2xl p-5 text-white shadow-md relative flex flex-col justify-center min-h-[110px] transition-transform hover:scale-105"
      :class="variant === 'dark' ? 'bg-gray-500' : 'bg-gray-400'"
    >
      <div class="flex justify-between items-start">
        <div class="text-4xl font-bold">{{ value }}</div>
        <img src="@/assets/infoIcon.svg" class="h-5 w-5 opacity-60 brightness-0 invert" />
      </div>
      
      <div class="mt-2">
        <div class="text-sm font-medium opacity-90">{{ label }}</div>
        <div v-if="subLabel" class="text-[11px] mt-1 opacity-60 text-right uppercase tracking-wider">
          {{ subLabel }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Props {
    value: string | number
    label: string
    subLabel?: string
    variant?: 'default' | 'dark' 
  }
  
  withDefaults(defineProps<Props>(), {
    variant: 'default'
  })
  </script>