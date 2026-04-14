<template>
    <div class="relative bg-white rounded-2xl shadow-lg p-6 w-full h-full flex flex-col min-h-[350px]">
      <div class="flex items-center relative justify-between mb-4">
        <h2 class="text-xl font-semibold text-light-gray">{{ title }}</h2>
        <button @click="show = true" class="cursor-pointer hover:opacity-70 transition-opacity">
          <img src="@/assets/infoIcon.svg" alt="Info" class="h-5" />
        </button>
      </div>
  
      <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400 animate-pulse">
        A carregar dados...
      </div>
  
      <div v-else class="flex-1 relative w-full min-h-0">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
  
      <div
        v-if="show"
        class="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10 p-8 transition-all"
      >
        <div class="relative w-full h-full flex flex-col items-center gap-6">
          <div class="flex items-center w-full justify-between">
            <h2 class="text-xl font-semibold text-light-gray">{{ title }}</h2>
            <button
              class="text-xl text-gray-400 absolute top-0 right-0 cursor-pointer hover:text-red-400"
              @click="show = false"
            >
              ✕
            </button>
          </div>
          <p class="text-lg text-left self-start text-gray-600 leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js'
  
  
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
  
  
  const props = defineProps<{
    title: string
    description: string
    chartData: any 
    loading?: boolean
  }>()
  
  const show = ref(false)
  
  
  const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#666'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#999' }
      },
      y: {
        grid: { display: true, color: '#f0f0f0' }, 
        ticks: { color: '#999' },
        beginAtZero: true
      }
    }
  }))
  </script>