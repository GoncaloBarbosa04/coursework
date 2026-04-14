<template>
  <div class="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col w-full">
    <div class="flex items-center relative justify-between mb-6">
      <h2 class="text-xl font-semibold text-light-gray">Reservas Mensais</h2>
      <button @click="show = true" class="absolute top-2 right-2 cursor-pointer">
        <img src="../assets/infoIcon.svg" alt="Info" class="h-5" />
      </button>
    </div>

    <div class="flex gap-4 h-full">
      <div class="flex-1">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <div class="w-48">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Propriedade</h3>
        <div class="space-y-3">
          <div
            v-for="(item, index) in legendItems"
            :key="index"
            class="flex items-center gap-2 cursor-pointer"
            @click="selectType(index)"
          >
            <div
              class="w-4 h-4 rounded-full flex justify-center items-center border-2"
              :style="{ borderColor: item.color }"
            >
              <div
                v-if="selectedType === index"
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: item.color }"
              />
            </div>
            <span class="text-sm">{{ item.label }}</span>
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
          <h2 class="text-xl font-semibold text-light-gray">Reservas Mensais</h2>
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
          Comparação mensal do número de reservas, dependendo do tipo de estabelecimento
          selecionado. <br />
          Os botões de seleção de Propriedade, manipulam os dados em análise, modificando a
          propriedade em observação.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import * as api from '@/api'
import { useSessionStorage } from '@/stores/session'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
const session = useSessionStorage()
const show = ref(false)

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const legendItems = ref([
  { label: 'Alojamento Local', color: '#E57373', api: 'Entire home/apt' },
  { label: 'Hotel', color: '#42A5F5', api: 'Hotel room' },
  { label: 'Quarto Privado', color: '#9575CD', api: 'Private room' },
  { label: 'Quarto Partilhado', color: '#90CAF9', api: 'Shared room' },
])

const selectedType = ref(0)
const monthlyData = ref(Array(12).fill(0))

async function loadData() {
  const selected = legendItems.value[selectedType.value]
  monthlyData.value = await api.getMonthlyReservationsByPropertyType(selected.api)
}

watch(selectedType, loadData)
watch(
  () => [session.selected_city, session.selected_neighbourhood, session.selected_year],
  loadData,
  { deep: true },
)

onMounted(loadData)

const chartData = computed(() => ({
  labels: months,
  datasets: [
    {
      label: legendItems.value[selectedType.value].label,
      data: monthlyData.value,
      backgroundColor: legendItems.value[selectedType.value].color,
      borderRadius: 6,
      barThickness: 20,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
}

const selectType = (index) => {
  selectedType.value = index
}
</script>
