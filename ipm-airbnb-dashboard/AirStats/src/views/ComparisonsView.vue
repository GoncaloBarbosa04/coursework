<template>
  <div class="bg-off-white min-h-screen w-full flex flex-col">
    <AppNavbar />

    <div class="w-full flex justify-center mt-8 mb-4 px-6 z-20">
      <div class="bg-pink rounded-full py-3 px-10 shadow-lg flex items-center gap-8 md:gap-16">
        
        <div class="flex items-center gap-3 relative">
          <span class="text-white font-medium text-sm whitespace-nowrap">Cidade 1</span>
          <div class="relative bg-white rounded-full px-4 py-1.5 flex items-center w-48 md:w-64 shadow-inner transition-transform focus-within:scale-105">
             <img src="@/assets/searchIcon.svg" class="w-4 h-4 opacity-40 mr-2" />
             <input v-model="city1Input" @focus="showSuggestions1 = true" @blur="hideSuggestions(1)" class="bg-transparent border-none outline-none w-full text-gray-700 text-sm font-medium placeholder-gray-400" placeholder="Pesquisar..." autocomplete="off" />
          </div>
          <ul v-if="showSuggestions1 && filteredCities1.length > 0" class="absolute top-full right-0 mt-2 w-48 md:w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            <li v-for="city in filteredCities1" :key="city" @mousedown.prevent="selectCity(1, city)" class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors">{{ city }}</li>
          </ul>
        </div>

        <div class="flex items-center gap-3 relative">
          <span class="text-white font-medium text-sm whitespace-nowrap">Cidade 2</span>
          <div class="relative bg-white rounded-full px-4 py-1.5 flex items-center w-48 md:w-64 shadow-inner transition-transform focus-within:scale-105">
             <img src="@/assets/searchIcon.svg" class="w-4 h-4 opacity-40 mr-2" />
             <input v-model="city2Input" @focus="showSuggestions2 = true" @blur="hideSuggestions(2)" class="bg-transparent border-none outline-none w-full text-gray-700 text-sm font-medium placeholder-gray-400" placeholder="Pesquisar..." autocomplete="off" />
          </div>
          <ul v-if="showSuggestions2 && filteredCities2.length > 0" class="absolute top-full right-0 mt-2 w-48 md:w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            <li v-for="city in filteredCities2" :key="city" @mousedown.prevent="selectCity(2, city)" class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors">{{ city }}</li>
          </ul>
        </div>

      </div>
    </div>

    <div class="flex-1 px-6 py-4 w-full max-w-[1600px] mx-auto grid grid-cols-[280px_1fr] gap-8">
      
      <div>
        <AppSideBarIrregularities :filters="['ano', 'propriedade']" />
      </div>

      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
          <AppComparisonChart title="Reservas" description="Total de reservas por trimestre." :chart-data="reservationsChartData" :loading="loading" />
          <AppComparisonChart title="Preço Médio" description="Evolução do preço médio (€)." :chart-data="pricesChartData" :loading="loading" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AppDataContainer :name="`Estabelecimentos (${city1})`" :data="city1Stats?.totalListings || 0" description="Total de alojamentos." />
            <AppDataContainer :name="`Preço Médio Global (${city1})`" :data="city1Stats?.averagePrice || 0" description="Média de preço." />
            <AppDataContainer :name="`Estabelecimentos (${city2})`" :data="city2Stats?.totalListings || 0" description="Total de alojamentos." />
            <AppDataContainer :name="`Preço Médio Global (${city2})`" :data="city2Stats?.averagePrice || 0" description="Média de preço." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppSideBarIrregularities from '@/components/AppSideBarIrregularities.vue'
import AppComparisonChart from '@/components/AppComparasionChart.vue'
import AppDataContainer from '@/components/AppDataContainer.vue'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

const session = useSessionStorage()
const loading = ref(false)
const city1 = ref(session.selected_city || 'Madrid') 
const city2 = ref('Porto')
const city1Input = ref(city1.value)
const city2Input = ref(city2.value)
const allCities = ref<string[]>([])
const showSuggestions1 = ref(false)
const showSuggestions2 = ref(false)
const city1Stats = ref<any>(null)
const city2Stats = ref<any>(null)

onMounted(async () => {
  try { allCities.value = await api.list_Cities() } catch (e) {}
  session.setYear('Todas')
  session.setProperty('Todas')
})

const filteredCities1 = computed(() => !city1Input.value ? allCities.value : allCities.value.filter(c => c.toLowerCase().includes(city1Input.value.toLowerCase())))
const filteredCities2 = computed(() => !city2Input.value ? allCities.value : allCities.value.filter(c => c.toLowerCase().includes(city2Input.value.toLowerCase())))

function selectCity(i: number, n: string) {
  if (i === 1) { city1Input.value = n; city1.value = n; showSuggestions1.value = false }
  else { city2Input.value = n; city2.value = n; showSuggestions2.value = false }
}
function hideSuggestions(i: number) { setTimeout(() => { if (i === 1) showSuggestions1.value = false; else showSuggestions2.value = false }, 200) }

async function fetchData() {
  if (!city1.value || !city2.value) return
  loading.value = true
  try {
    const [res1, res2] = await Promise.all([
      api.getCityComparisonStats(city1.value, session.selected_year, session.selected_property),
      api.getCityComparisonStats(city2.value, session.selected_year, session.selected_property)
    ])
    city1Stats.value = res1; city2Stats.value = res2
  } catch (e) {} finally { loading.value = false }
}

watch([city1, city2, () => session.selected_year, () => session.selected_property], fetchData, { immediate: true })

const reservationsChartData = computed(() => ({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: city1.value, data: city1Stats.value?.quarterlyReservations || [0,0,0,0], backgroundColor: '#42A5F5', borderRadius: 4, barPercentage: 0.6 },
    { label: city2.value, data: city2Stats.value?.quarterlyReservations || [0,0,0,0], backgroundColor: '#EF5350', borderRadius: 4, barPercentage: 0.6 }
  ]
}))
const pricesChartData = computed(() => ({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: city1.value, data: city1Stats.value?.quarterlyPrices || [0,0,0,0], backgroundColor: '#42A5F5', borderRadius: 4, barPercentage: 0.6 },
    { label: city2.value, data: city2Stats.value?.quarterlyPrices || [0,0,0,0], backgroundColor: '#EF5350', borderRadius: 4, barPercentage: 0.6 }
  ]
}))
</script>