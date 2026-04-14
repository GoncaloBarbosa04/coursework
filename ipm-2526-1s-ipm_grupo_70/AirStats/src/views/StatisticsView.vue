<template>
  <div class="bg-off-white min-h-screen w-full">
    <AppNavbar />
    <div class="grid grid-cols-[1fr_5fr]">
      <div class="w-full flex flex-col gap-10 px-5 py-10">
        <AppSideBar :filters="['cidade', 'zona', 'ano']" />
        <AppDataContainer
          name="Preço Médio"
          :data="averagePrice"
          description="Preço médio de todos os tipos de estabelecimento"
        />
        <AppDataContainer
          name="Reservas Médias"
          :data="averageReservations"
          description="Número de médio de reservas de todos os tipos de estabelecimento"
        />
      </div>
      <div class="grd grid-rows-2 h-full">
        <div class="flex pt-10 px-5 gap-10">
          <AppPropertiesChartContainer />
          <AppPricesChartContainer />
        </div>
        <div class="grid grid-cols-[4fr_1fr] py-10 px-5 gap-10">
          <AppReservationsContainer />
          <div class="w-full flex flex-col gap-10">
            <AppDataContainer
              name="Reservas Curto-Prazo"
              :data="shortTermReservations"
              description="Número de Reservas com permanência superior a 30 dias"
            />
            <AppDataContainer
              name="Reservas Longo-Prazo"
              :data="longTermReservations"
              description="Número de Reservas com permanência superior ou igual a 30 dias"
            />
            <AppExportButton />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppSideBar from '@/components/AppSideBar.vue'
import AppDataContainer from '@/components/AppDataContainer.vue'
import AppPropertiesChartContainer from '@/components/AppPropertiesChartContainer.vue'
import AppPricesChartContainer from '@/components/AppPricesChartContainer.vue'
import AppReservationsContainer from '@/components/AppReservationsContainer.vue'
import AppExportButton from '@/components/AppExportButton.vue'
import * as api from '@/api.ts'
import { useSessionStorage } from '@/stores/session'

const session = useSessionStorage()

const averagePrice = ref<number | null>(null)
const averageReservations = ref<number | null>(null)
const shortTermReservations = ref<number | null>(null)
const longTermReservations = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchData() {
  loading.value = true
  error.value = null

  try {
    const stats = await api.getDashboardStats()

    averagePrice.value = stats.averagePrice
    averageReservations.value = stats.totalReservations
    shortTermReservations.value = stats.shortTermReservations
    longTermReservations.value = stats.longTermReservations
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  watch(
    () => [session.selected_city, session.selected_neighbourhood, session.selected_year],
    () => {
      fetchData()
    },
    { immediate: true },
  )

  watch(
    () => session.selected_city,
    (newCity, oldCity) => {
      if (newCity !== oldCity) {
        session.setNeighbourhood('Todas')
        session.setYear('Todas')
        session.setProperty('Todas')
      }
    },
  )
})
</script>
