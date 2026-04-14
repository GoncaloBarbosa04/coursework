<template>
  <div class="relative bg-white rounded-2xl shadow-lg p-8 w-full min-h-full">
    <div class="flex items-center relative justify-between mb-6">
      <h2 class="text-xl font-semibold text-light-gray">Preços</h2>
      <button @click="show = true" class="absolute top-2 right-2 cursor-pointer">
        <img src="../assets/infoIcon.svg" alt="Info" class="h-5" />
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Carregando...</div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-[3fr_1fr] gap-5">
      <!-- Table -->
      <div class="flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="grid grid-cols-[1fr_100px] bg-pink items-start">
          <div class="px-4 py-3 text-sm font-bold text-white">Propriedade</div>
          <div class="px-4 py-3 text-sm font-bold text-white text-center">Reservas</div>
        </div>
        <!-- Rows -->
        <div
          v-for="(item, index) in properties"
          :key="index"
          class="grid grid-cols-[1fr_100px] border-b border-light-gray/30 last:border-b-0"
        >
          <div class="px-4 py-3 text-sm text-dark-gray">{{ item.propertyType }}</div>
          <div class="px-4 py-3 text-sm text-light-gray border-l border-light-gray/30 text-center">
            {{ item.reservations }}
          </div>
        </div>
        <!-- Total Row -->
        <div class="grid grid-cols-[1fr_100px] bg-gray-50 font-semibold">
          <div class="px-4 py-3 text-sm text-dark-gray">Total</div>
          <div class="px-4 py-3 text-sm text-dark-gray border-l border-light-gray/30 text-center">
            {{ totalReservations }}
          </div>
        </div>
      </div>

      <!-- Slider Section -->
      <div class="flex flex-col items-center justify-center w-full">
        <div class="text-sm font-medium text-dark-gray mb-2">
          {{ priceRangeMin }}€ - {{ priceRangeMax }}€
        </div>

        <div class="relative h-[200px] flex items-center">
          <input
            type="range"
            v-model="selectedPriceRange"
            :min="0"
            :max="maxRangeIndex"
            :step="1"
            class="vertical-slider"
            orient="vertical"
          />

          <div class="slider-dots">
            <span
              v-for="i in maxRangeIndex + 1"
              :key="i"
              :class="{ active: i - 1 === selectedPriceRange }"
            ></span>
          </div>
        </div>

        <div class="text-xs text-gray-400 mt-2">0€ - {{ maxPrice }}€</div>
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
        <p class="text-lg text-left text-light-gray">
          Comparação da variação do preço por reserva entre tipos de propriedade. <br />
          O slider manipula os dados em observação, mudando o range de preços em análise.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

const session = useSessionStorage()
const show = ref(false)

// Data
const properties = ref<{ propertyType: string; reservations: number }[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Step and max
const priceStep = 100
const maxPrice = 1000
const selectedPriceRange = ref(0) // index of current range

// Number of ranges
const maxRangeIndex = computed(() => Math.floor(maxPrice / priceStep) - 1)

// Compute min and max for the currently selected range
const priceRangeMin = computed(() => selectedPriceRange.value * priceStep)
const priceRangeMax = computed(() => priceRangeMin.value + priceStep - 1)

const totalReservations = computed(() =>
  properties.value.reduce((sum, prop) => sum + prop.reservations, 0),
)

// Fetch data for selected price range
async function fetchData() {
  loading.value = true
  error.value = null

  try {
    const data = await api.getReservationsByPropertyTypeAndPriceRange(
      priceRangeMin.value,
      priceRangeMax.value,
    )
    properties.value = data
  } catch (err) {
    console.error('Error fetching property type data:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

// Watch for changes in price range
watch(selectedPriceRange, () => {
  fetchData()
})

// Watch for changes in session filters
watch(
  () => [session.selected_city, session.selected_neighbourhood, session.selected_year],
  () => {
    fetchData()
  },
  { deep: true },
)

// Initial load
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Vertical slider styling */
.vertical-slider {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 8px;
  height: 200px;
  padding: 0;
  margin: 10px auto;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

.vertical-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #9ca3af;
  border-radius: 50%;
  cursor: pointer;
}

.vertical-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #9ca3af;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.vertical-slider::-webkit-slider-thumb:hover {
  background: #6b7280;
}

.vertical-slider::-moz-range-thumb:hover {
  background: #6b7280;
}

.slider-dots {
  position: absolute;
  right: -12px;
  height: 195px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.slider-dots span {
  width: 6px;
  height: 6px;
  background: #d1d5db;
  border-radius: 50%;
  display: block;
}

.slider-dots span.active {
  background: #ec4899; /* pink */
  transform: scale(1.4);
}
</style>
