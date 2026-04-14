<template>
  <div class="relative bg-white rounded-2xl shadow-lg p-8 w-full min-h-full max-w-2xl">
    <div class="flex items-center relative justify-between mb-6">
      <h2 class="text-xl font-semibold text-light-gray">Estabelecimentos</h2>
      <button @click="show = true" class="absolute top-2 right-2 cursor-pointer">
        <img src="../assets/infoIcon.svg" alt="Info" class="h-5" />
      </button>
    </div>

    <div v-if="loading" class="text-center text-light-gray py-10">Carregando...</div>

    <div v-else class="flex flex-col md:flex-row items-center gap-10">
      <div class="w-64 h-64">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>

      <div class="flex-1 space-y-3">
        <div v-for="(item, index) in legendItems" :key="index" class="flex items-center gap-3">
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: item.color }"
          />
          <div class="flex-1">
            <div class="text-sm text-dark-gray">{{ item.label }}</div>
            <div class="text-xs text-dark-gray">{{ item.value }} ({{ item.percentage }}%)</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="show"
      class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl z-10 p-8"
    >
      <div class="relative w-full h-full flex flex-col items-center gap-10">
        <div class="flex items-center w-full justify-between">
          <h2 class="text-xl font-semibold text-light-gray">Preços</h2>
          <button
            class="text-xl text-light-gray absolute top-2 right-2 cursor-pointer"
            @click="show = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-lg text-left self-start text-light-gray">
          Comparação do número de reservas, por tipo de propriedade.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

ChartJS.register(ArcElement, Tooltip, Legend)

const show = ref(false)
const loading = ref(true)
const legendItems = ref([])

const COLORS = ['#E57373', '#42A5F5', '#9575CD', '#90CAF9']

// Mapping English -> Portuguese
const TYPE_MAP = {
  'Entire home/apt': 'Alojamento Local',
  'Hotel room': 'Hotel',
  'Private room': 'Quarto Privado',
  'Shared room': 'Quarto Partilhado',
}

const loadData = async () => {
  loading.value = true

  try {
    const data = await api.getReservationsByPropertyType()

    legendItems.value = data.map((item, index) => ({
      color: COLORS[index % COLORS.length],
      label: TYPE_MAP[item.property_type] || item.property_type,
      value: item.reservations,
      percentage: item.percentage,
    }))
  } catch (error) {
    console.error('Erro ao carregar estabelecimentos:', error)
  } finally {
    loading.value = false
  }
}

// Auto reload when filters change
const session = useSessionStorage()
watch(
  () => [session.selected_city, session.selected_neighbourhood, session.selected_year],
  loadData,
  { deep: true },
)

onMounted(loadData)

const chartData = computed(() => ({
  labels: legendItems.value.map((i) => i.label),
  datasets: [
    {
      data: legendItems.value.map((i) => i.value),
      backgroundColor: legendItems.value.map((i) => i.color),
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label(context) {
          const label = context.label
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}
</script>