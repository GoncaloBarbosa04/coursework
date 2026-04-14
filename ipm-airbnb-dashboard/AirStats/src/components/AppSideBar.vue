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
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" stroke-width="2" />
              <path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              type="text"
              :placeholder="getFilterConfig(filter).placeholder"
              v-model="searchValues[getFilterId(filter)]"
              class="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
              @input="onCityInput(getFilterId(filter))"
            />
          </div>

          <!-- Selected city -->
          <div
            v-if="selectedValues[getFilterId(filter)]"
            class="flex items-center justify-between mt-2"
          >
            <span class="text-white text-sm">Selecionada:</span>
            <span class="bg-white opacity-80 text-blue px-3 py-1 rounded-full text-sm font-medium">
              {{ selectedValues[getFilterId(filter)] }}
            </span>
          </div>

          <!-- Suggestions -->
          <div
            v-if="searchValues[getFilterId(filter)]"
            class="mt-2 bg-white rounded-lg max-h-40 overflow-y-auto"
          >
            <div
              v-for="option in getFilteredOptions(filter)"
              :key="option"
              @click="handleSelect(getFilterId(filter), option)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
            >
              {{ option }}
            </div>
            <!-- Show "Cidade não disponível" if no matches -->
            <div
              v-if="getFilteredOptions(filter).length === 0"
              class="px-4 py-2 text-gray-400 cursor-not-allowed"
            >
              Cidade não disponível
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
            <span>{{
              selectedValues[getFilterId(filter)] || getFilterConfig(filter).options[0]
            }}</span>
            <svg
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': openDropdown === getFilterId(filter) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            v-if="openDropdown === getFilterId(filter)"
            class="mt-2 bg-white rounded-lg shadow-lg overflow-hidden"
          >
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
                  :checked="
                    (selectedValues[getFilterId(filter)] || getFilterConfig(filter).options[0]) ===
                    option
                  "
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
                  :checked="(selectedValues[getFilterId(filter)] || []).includes(option.label)"
                  class="absolute opacity-0 w-0 h-0"
                />
                <div
                  class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  :class="
                    (selectedValues[getFilterId(filter)] || []).includes(option.label)
                      ? option.color === 'pink'
                        ? 'bg-pink-500 border-pink-500'
                        : 'bg-white border-white'
                      : 'bg-transparent border-white'
                  "
                >
                  <svg
                    v-if="(selectedValues[getFilterId(filter)] || []).includes(option.label)"
                    :class="option.color === 'pink' ? 'text-white' : 'text-teal-700'"
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
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
import { ref, computed } from 'vue'
import { useSessionStorage } from '@/stores/session.ts'
import { filters as cityFilters } from '../filters'

interface FilterProp {
  id?: string
  title?: string
  type?: string
  placeholder?: string
  options?: any[]
}

interface Props {
  filters?: (string | FilterProp)[]
}

withDefaults(defineProps<Props>(), {
  filters: () => ['cidade', 'zona', 'ano', 'propriedade'],
})

const session = useSessionStorage()
const cityOptions = Object.keys(cityFilters)

const searchValues = ref<Record<string, string>>({})
const openDropdown = ref<string | null>(null)

const selectedValues = computed(() => ({
  cidade: session.selected_city,
  zona: session.selected_neighbourhood,
  ano: session.selected_year,
  propriedade: session.selected_property,
}))

// --- dynamic filters based on selected city ---
const dynamicFilters = computed(() => ({
  cidade: {
    title: 'Cidade',
    type: 'search',
    placeholder: 'Procurar cidade...',
    options: cityOptions,
  },
  zona: {
    title: 'Zona',
    type: 'dropdown',
    options: ['Todas', ...(cityFilters[session.selected_city]?.neighbourhoods ?? [])],
  },
  ano: {
    title: 'Ano',
    type: 'dropdown',
    options: ['Todas', ...(cityFilters[session.selected_city]?.years ?? [])],
  },
  propriedade: {
    title: 'Propriedade',
    type: 'dropdown',
    options: ['Todas', ...(cityFilters[session.selected_city]?.property_types ?? [])],
  },
  estatisticos: {
    title: 'Estatísticos',
    type: 'checkbox',
    options: [
      { label: 'Gerais', color: 'white' },
      { label: 'Licenças', color: 'pink' },
      { label: 'Alojamento Local', color: 'white' },
    ],
  },
}))

// --- helpers ---
const getFilterId = (filter: string | FilterProp): string => {
  return typeof filter === 'string' ? filter : filter.id || ''
}

const getFilterConfig = (filter: string | FilterProp) => {
  if (!filter) return {}
  if (typeof filter === 'string') {
    return dynamicFilters.value[filter] || {}
  }
  return { ...dynamicFilters.value[filter.id || ''], ...filter }
}

// --- filtered options for search inputs ---
const getFilteredOptions = (filter: string | FilterProp) => {
  const filterId = getFilterId(filter)
  const config = getFilterConfig(filter)
  const searchValue = searchValues.value[filterId] || ''

  return config.options.filter((opt: string) =>
    opt.toLowerCase().includes(searchValue.toLowerCase()),
  )
}

// --- handlers ---
const toggleDropdown = (filterId: string) => {
  openDropdown.value = openDropdown.value === filterId ? null : filterId
}

const handleSelect = (filterId: string, value: string) => {
  openDropdown.value = null
  searchValues.value[filterId] = ''

  if (filterId === 'cidade') {
    // Only here do we update the session
    session.setCity(value)

    // Reset dependent filters
    session.setNeighbourhood('Todas')
    session.setYear('Todas')
    session.setProperty('Todas')
  } else if (filterId === 'zona') {
    session.setNeighbourhood(value)
  } else if (filterId === 'ano') {
    session.setYear(value)
  } else if (filterId === 'propriedade') {
    session.setProperty(value)
  }
}

// Checkbox handler
const handleCheckbox = (filterId: string, option: string) => {
  const current = selectedValues.value[filterId] || []
  const updated = current.includes(option)
    ? current.filter((item: string) => item !== option)
    : [...current, option]

  selectedValues.value[filterId] = updated
}

const onCityInput = (filterId: string) => {
  searchValues.value[filterId] = (searchValues.value[filterId] || '').trim()
}
</script>
