<template>
  <div class="w-full max-w-sm bg-blue rounded-2xl shadow-2xl overflow-hidden shadow-2xl">
    <div class="h-16 border-b-1 border-white bg-pink flex items-center justify-center">
      <h2 class="text-white font-bold text-xl">Filtros</h2>
    </div>

    <div class="pb-4">
      <div v-for="(filter, index) in filters" :key="index">
        
        <div
          v-if="getFilterConfig(filter).type === 'search'"
          class="border-b border-white px-4 py-4 relative"
        >
          <div class="text-white font-semibold mb-3">{{ getFilterConfig(filter).title }}</div>
          <div class="relative mb-2">
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" stroke-width="2" />
              <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              type="text"
              :placeholder="getFilterConfig(filter).placeholder"
              v-model="searchValues[getFilterId(filter)]"
              class="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              @input="onInputFocus(getFilterId(filter))"
            />
          </div>

          <div v-if="selectedValues[getFilterId(filter)]" class="flex items-center justify-between mt-2">
            <span class="text-white text-sm">Selecionada:</span>
            <span class="bg-white opacity-80 text-blue px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedValues[getFilterId(filter)] }}
            </span>
          </div>

          <div v-if="searchValues[getFilterId(filter)]" class="mt-2 bg-white rounded-lg max-h-40 overflow-y-auto">
            <div
              v-for="option in getFilteredOptions(filter)"
              :key="option"
              @click="handleSelect(getFilterId(filter), option)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <div
          v-else-if="getFilterConfig(filter).type === 'dropdown'"
          class="border-b border-white px-4 py-4"
        >
          <div class="text-white font-semibold mb-2">{{ getFilterConfig(filter).title }}</div>
          <button
            @click="toggleDropdown(getFilterId(filter))"
            class="w-full flex items-center justify-between bg-blue text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
          >
            <span>{{ selectedValues[getFilterId(filter)] || 'Todas' }}</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openDropdown === getFilterId(filter) }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div v-if="openDropdown === getFilterId(filter)" class="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="max-h-48 overflow-y-auto">
              <label
                v-for="option in getFilterConfig(filter).options"
                :key="option"
                class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                @click="handleSelect(getFilterId(filter), option)"
              >
                <input
                  type="radio"
                  :name="getFilterId(filter)"
                  :checked="(selectedValues[getFilterId(filter)] || 'Todas') === option"
                  class="mr-3 w-4 h-4 accent-purple-600"
                />
                <span class="text-gray-700">{{ option }}</span>
              </label>
            </div>
          </div>
        </div>

        <div
          v-else-if="getFilterConfig(filter).type === 'checkbox'"
          class="border-b border-teal-600 px-4 py-4"
        >
          <div class="text-white font-semibold mb-3">{{ getFilterConfig(filter).title }}</div>
          <div class="space-y-2">
            <label
              v-for="option in getFilterConfig(filter).options"
              :key="option.label"
              class="flex items-center cursor-pointer group"
              @click="handleCheckbox(getFilterId(filter), option.label)"
            >
              <div class="relative">
                <input
                  type="checkbox"
                  :checked="isCheckboxActive(getFilterId(filter), option.label)"
                  class="absolute opacity-0 w-0 h-0"
                />
                <div
                  class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  :class="
                    isCheckboxActive(getFilterId(filter), option.label)
                      ? option.color === 'pink'
                        ? 'bg-pink border-pink' 
                        : 'bg-white border-white'
                      : 'bg-transparent border-white'
                  "
                  :style="isCheckboxActive(getFilterId(filter), option.label) && option.color === 'pink' ? 'background-color: #ec4899; border-color: #ec4899;' : ''"
                >
                  <svg
                    v-if="isCheckboxActive(getFilterId(filter), option.label)"
                    :class="option.color === 'pink' ? 'text-white' : 'text-teal-700'"
                    class="w-3 h-3"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span class="ml-3 text-white">{{ option.label }}</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

interface FilterProp { id?: string; title?: string; type?: string; placeholder?: string; options?: any[] }
interface Props { filters?: (string | FilterProp)[] }

const props = withDefaults(defineProps<Props>(), {
  filters: () => ['cidade', 'zona', 'ano', 'propriedade'],
})

const session = useSessionStorage()
const apiCities = ref<string[]>([])
const apiNeighbourhoods = ref<string[]>([])
const apiYears = ref<string[]>(['2022', '2023', '2024', '2025'])
const searchValues = ref<Record<string, string>>({})
const openDropdown = ref<string | null>(null)

async function loadInitialData() {
  try {
    apiCities.value = await api.list_Cities()
    if (session.selected_city) await loadZonesForCity(session.selected_city)
  } catch (e) { console.error(e) }
}

async function loadZonesForCity(city: string) {
  try {
    const listings = await api.list_ListingsByCity(city)
    const zones = new Set(listings.map((l: any) => l.neighbourhood_cleansed || l.neighbourhood).filter(Boolean))
    apiNeighbourhoods.value = Array.from(zones).sort()
  } catch (e) { apiNeighbourhoods.value = [] }
}

onMounted(loadInitialData)
watch(() => session.selected_city, async (newCity) => { if (newCity) await loadZonesForCity(newCity); else apiNeighbourhoods.value = [] })

const selectedValues = computed(() => ({
  cidade: session.selected_city,
  zona: session.selected_neighbourhood,
  ano: session.selected_year,
  propriedade: session.selected_property,
}))

const dynamicFilters = computed(() => ({
  cidade: { title: 'Cidade', type: 'search', placeholder: 'Procurar cidade...', options: apiCities.value },
  zona: { title: 'Zona', type: 'dropdown', options: ['Todas', ...apiNeighbourhoods.value] },
  ano: { title: 'Ano', type: 'dropdown', options: ['Todas', ...apiYears.value] },
  propriedade: { title: 'Propriedade', type: 'dropdown', options: ['Todas', 'Alojamento Local', 'Hotel', 'Quarto Privado', 'Quarto Partilhado'] },
  estatisticos: { 
    title: 'Estatísticas', 
    type: 'checkbox', 
    options: [
      { label: 'Gerais', color: 'white' }, 
      { label: 'Licenças', color: 'pink' }, 
      { label: 'Alojamento Local', color: 'pink' }
    ] 
  }
}))

const getFilterId = (f: any) => typeof f === 'string' ? f : f.id || ''
const getFilterConfig = (f: any) => { const id = getFilterId(f); return typeof f === 'string' ? (dynamicFilters.value[id] || {}) : { ...dynamicFilters.value[id], ...f } }
const getFilteredOptions = (f: any) => { const c = getFilterConfig(f); return (c.options || []).filter((o: string) => o.toLowerCase().includes((searchValues.value[getFilterId(f)] || '').toLowerCase())) }

const onInputFocus = (id: string) => { if (!searchValues.value[id]) searchValues.value[id] = '' }
const toggleDropdown = (id: string) => { openDropdown.value = openDropdown.value === id ? null : id }

const handleSelect = (id: string, value: string) => {
  openDropdown.value = null; searchValues.value[id] = ''
  if (id === 'cidade') { session.setCity(value); session.setNeighbourhood('Todas'); session.setYear('Todas'); session.setProperty('Todas'); }
  else if (id === 'zona') session.setNeighbourhood(value)
  else if (id === 'ano') session.setYear(value)
  else if (id === 'propriedade') session.setProperty(value)
}

const isCheckboxActive = (id: string, label: string) => {
  if (id === 'estatisticos') return session.currentView === label
  return false
}

const handleCheckbox = (id: string, label: string) => {
  if (id === 'estatisticos' && session.setView) {
    session.setView(label)
  }
}
</script>