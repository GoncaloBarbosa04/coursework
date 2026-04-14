<template>
  <div class="bg-off-white h-screen w-full flex flex-col overflow-hidden">
    <AppNavbar />

    <div class="flex-1 grid grid-cols-[1fr_4fr] gap-8 px-8 py-8 h-[calc(100vh-80px)] overflow-hidden">
      <div class="h-full overflow-hidden">
        <AppSideBarIrregularities :filters="sidebarFilters" />
      </div>

      <div class="flex flex-col h-full gap-6 overflow-hidden">
        
        <div v-if="currentView === 'Gerais'" class="grid grid-cols-[3fr_1fr] gap-6 h-full min-h-0">
          <div class="bg-white p-2 rounded-2xl shadow-lg h-full border border-gray-100 relative min-h-0">
            <AppMap :geo-json-data="mapGeoJson" :zone-data="mapZoneStats" :center-coords="mapCenter" />
            <div v-if="loading" class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center"><span class="text-pink font-bold animate-pulse">A carregar...</span></div>
          </div>
          
          <div class="flex flex-col gap-4 h-full overflow-y-auto pr-1 min-h-0">
            <AppDataContainer 
              v-for="(stat, index) in generalStats" 
              :key="index" 
              :name="stat.label"
              :data="stat.value" 
              :description="stat.description"
            />
            <div class="mt-auto pt-4 w-full"><AppExportButton class="w-full shadow-lg" /></div>
          </div>
        </div>

        <div v-else class="flex flex-col h-full gap-6 min-h-0">
          <div class="bg-white rounded-2xl p-8 shadow-md flex justify-between items-center min-h-[160px] flex-shrink-0">
            <div class="max-w-2xl">
              <h2 class="text-3xl font-bold text-dark-gray mb-3">{{ currentView }}</h2>
              <p class="text-gray-500 text-sm leading-relaxed">{{ viewDescription }}</p>
            </div>
            
            <div class="flex gap-6 w-full max-w-lg justify-end">
              <div class="w-48" v-for="stat in headerStats" :key="stat.label">
                <AppDataContainer 
                  :name="stat.label"
                  :data="stat.value"
                  :description="stat.description"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6 flex-1 min-h-0">
            <div class="bg-white p-2 rounded-2xl shadow-lg h-full border border-gray-100 relative min-h-0">
              <AppMap :geo-json-data="mapGeoJson" :zone-data="mapZoneStats" :center-coords="mapCenter" />
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col border border-gray-100 relative overflow-hidden min-h-0">
              <div v-if="currentView === 'Licenças'" class="h-full flex flex-col items-center justify-center min-h-0">
                 <h3 class="text-lg font-bold text-gray-600 mb-4 self-start border-b pb-2 w-full">Licenciamentos</h3>
                 <div class="w-full flex-1 relative min-h-0 flex items-center justify-center">
                   <div class="w-72 h-72"><Doughnut :data="chartData" :options="chartOptions" /></div>
                 </div>
              </div>

              <div v-if="currentView === 'Alojamento Local'" class="h-full flex flex-col overflow-hidden min-h-0">
                <div class="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
                  <h3 class="text-lg font-bold text-gray-600">Estabelecimentos</h3><img src="@/assets/infoIcon.svg" class="h-5 opacity-40" />
                </div>
                <div class="overflow-auto flex-1 pr-2 scrollbar-thin min-h-0">
                  <table class="w-full text-sm text-left text-gray-600">
                    <thead class="text-xs text-gray-500 uppercase border-b sticky top-0 bg-white shadow-sm z-10">
                      <tr><th class="py-3 font-semibold bg-white">Propriedade</th><th class="py-3 text-right font-semibold bg-white">Preço Médio (€)</th><th class="py-3 text-right font-semibold bg-white">Lotação (%)</th></tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="item in alTableData" :key="item.id" class="hover:bg-gray-50 transition-colors">
                        <td class="py-3 truncate max-w-[180px]">{{ item.name }}</td><td class="py-3 text-right font-medium">{{ item.price }}</td>
                        <td class="py-3 text-right"><span :class="item.occupancy > 80 ? 'text-green-500 font-bold' : 'text-gray-500'">{{ item.occupancy }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="mt-4 flex justify-end flex-shrink-0"><AppExportButton /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import AppNavbar from '@/components/AppNavbar.vue'
import AppSideBarIrregularities from '@/components/AppSideBarIrregularities.vue'
import AppExportButton from '@/components/AppExportButton.vue'
import AppMap from '@/components/AppMap.vue'
import AppDataContainer from '@/components/AppDataContainer.vue'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

ChartJS.register(ArcElement, Tooltip, Legend)
const session = useSessionStorage()

const sidebarFilters = ['cidade', 'zona', 'ano', { id: 'estatisticos', title: 'Estatísticas', type: 'checkbox', options: [{ label: 'Gerais', color: 'pink' }, { label: 'Licenças', color: 'pink' }, { label: 'Alojamento Local', color: 'pink' }] }]

const currentView = computed(() => session.currentView || 'Gerais') 
const loading = ref(false)
const mapGeoJson = ref(null)
const mapZoneStats = ref({})
const mapCenter = ref<[number, number]>([38.7223, -9.1393])

const irregularityStats = ref({ excessiveOccupancy: 0, priceAnomalies: 0, noLicense: 0, multipleListings: 0 })
const licenseStats = ref({ withLicense: 0, withoutLicense: 0, exempt: 0 })
const alTableData = ref<any[]>([])
const alStats = ref({ count: 0, avgPrice: 0 })

async function fetchData() {
  loading.value = true
  try {
    const city = session.selected_city || 'Lisboa'
    mapCenter.value = await api.getCityCenterCoordinates(city)
    mapZoneStats.value = await api.getIrregularitiesByNeighbourhood()

    mapGeoJson.value = null
    try {
      const localRes = await fetch(`/${city}.json`)
      if (localRes.ok) mapGeoJson.value = await localRes.json()
      else {
        const osmRes = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${city}&polygon_geojson=1&format=json&limit=1`)
        const osmData = await osmRes.json()
        if (osmData && osmData.length > 0) mapGeoJson.value = osmData[0].geojson
      }
    } catch (e) { console.warn("Erro GeoJSON:", e) }

    if (currentView.value === 'Gerais') irregularityStats.value = await api.getIrregularityStats()
    else if (currentView.value === 'Licenças') licenseStats.value = await api.getLicenseStats()
    else if (currentView.value === 'Alojamento Local') {
      alTableData.value = await api.getTopListingsData()
      const dashboardStats = await api.getDashboardStats()
      if (dashboardStats) alStats.value = { count: dashboardStats.totalReservations, avgPrice: dashboardStats.averagePrice }
    }
  } catch (error) { console.error("Erro dashboard:", error) } finally { loading.value = false }
}

onMounted(() => {
  session.setView('Gerais')
})

watch(() => [session.selected_city, session.selected_neighbourhood, session.selected_year, currentView.value], fetchData, { immediate: true })

const viewDescription = computed(() => currentView.value === 'Licenças' ? 'Análise detalhada do cumprimento legal dos anúncios.' : 'Lista dos estabelecimentos com maior faturação e ocupação.')

const generalStats = computed(() => [
  { value: irregularityStats.value.excessiveOccupancy, label: 'Ocupação Excessiva', description: 'Número de alojamentos com ocupação muito elevada e disponibilidade reduzida.' },
  { value: irregularityStats.value.priceAnomalies, label: 'Preços Anómalos', description: 'Alojamentos com preço por noite significativamente acima da média.' },
  { value: irregularityStats.value.noLicense, label: 'Sem Licença', description: 'Alojamentos listados que não apresentam número de licença válido.' },
  { value: irregularityStats.value.multipleListings, label: 'Múltiplos Alojamentos', description: 'Anfitriões que gerem um elevado número de propriedades em simultâneo.' }
])

const headerStats = computed(() => {
  if (currentView.value === 'Licenças') {
    const total = licenseStats.value.withLicense + licenseStats.value.withoutLicense + licenseStats.value.exempt || 1
    return [
      { value: Math.round((licenseStats.value.withoutLicense/total)*100), label: 'Sem Licença (%)', description: 'Percentagem de alojamentos sem licença registada.' },
      { value: Math.round((licenseStats.value.withLicense/total)*100), label: 'Com Licença (%)', description: 'Percentagem de alojamentos com licença válida.' }
    ]
  }
  return [
    { value: alStats.value.count, label: 'Estabelecimentos', description: 'Total de alojamentos locais registados na seleção atual.' },
    { value: alStats.value.avgPrice, label: 'Preço Médio (€)', description: 'Preço médio por noite de todos os alojamentos listados.' }
  ]
})

const chartData = computed(() => ({ labels: ['C/ Licença', 'S/ Licença', 'Isento'], datasets: [{ backgroundColor: ['#4ade80', '#f87171', '#60a5fa'], borderWidth: 0, data: [licenseStats.value.withLicense, licenseStats.value.withoutLicense, licenseStats.value.exempt] }] }))
const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right' as const } } }
</script>