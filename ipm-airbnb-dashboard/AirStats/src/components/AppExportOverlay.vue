<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center"
        @click.self="closeOverlay"
      >
        <div class="bg-blue rounded-2xl overflow-hidden flex flex-col w-sm shadow-2xl">
          <!-- Header -->
          <div class="flex bg-pink border-b-1 border-white items-cente p-4 justify-between">
            <h2 class="text-2xl font-bold text-white text-center w-full">Exportar</h2>
            <button @click="closeOverlay" class="text-white hover:text-gray-300 transition-colors">
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

          <!-- Export Buttons -->
          <div class="space-y-4 p-10">
            <button
              @click="exportJSON"
              class="w-full bg-white text-dark-gray text-teal-dark font-semibold py-4 px-6 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span class="text-lg">JSON</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </button>

            <button
              @click="exportCSV"
              class="w-full bg-white text-dark-gray font-semibold py-4 px-6 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span class="text-lg">CSV</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useSessionStorage } from '@/stores/session'
import * as api from '@/api'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const session = useSessionStorage()

function closeOverlay() {
  emit('close')
}

async function exportJSON() {
  try {
    // Fetch all data based on current filters
    const listings = session.selected_city
      ? await api.list_ListingsByCity(session.selected_city)
      : await api.list_AllListings()

    // Apply filters
    let filteredListings = listings

    if (session.selected_neighbourhood && session.selected_neighbourhood !== 'Todas') {
      const target = session.selected_neighbourhood.toLowerCase()
      filteredListings = filteredListings.filter((listing: any) => {
        if (listing.neighbourhood_group) {
          return listing.neighbourhood_group.toLowerCase() === target
        }
        return listing.neighbourhood?.toLowerCase() === target
      })
    }

    if (session.selected_year && session.selected_year !== 'Todas') {
      filteredListings = filteredListings.filter(
        (listing: any) =>
          listing.last_review && listing.last_review.startsWith(String(session.selected_year)),
      )
    }

    // Create JSON blob
    const dataStr = JSON.stringify(filteredListings, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = `airstats_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    closeOverlay()
  } catch (error) {
    console.error('Error exporting JSON:', error)
    alert('Erro ao exportar dados')
  }
}

async function exportCSV() {
  try {
    // Fetch all data based on current filters
    const listings = session.selected_city
      ? await api.list_ListingsByCity(session.selected_city)
      : await api.list_AllListings()

    // Apply filters
    let filteredListings = listings

    if (session.selected_neighbourhood && session.selected_neighbourhood !== 'Todas') {
      const target = session.selected_neighbourhood.toLowerCase()
      filteredListings = filteredListings.filter((listing: any) => {
        if (listing.neighbourhood_group) {
          return listing.neighbourhood_group.toLowerCase() === target
        }
        return listing.neighbourhood?.toLowerCase() === target
      })
    }

    if (session.selected_year && session.selected_year !== 'Todas') {
      filteredListings = filteredListings.filter(
        (listing: any) =>
          listing.last_review && listing.last_review.startsWith(String(session.selected_year)),
      )
    }

    if (filteredListings.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    // Get headers from first object
    const headers = Object.keys(filteredListings[0])

    // Create CSV content
    let csvContent = headers.join(',') + '\n'

    filteredListings.forEach((listing: any) => {
      const row = headers.map((header) => {
        const value = listing[header]
        // Escape commas and quotes in values
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      csvContent += row.join(',') + '\n'
    })

    // Create CSV blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = `airstats_data_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    closeOverlay()
  } catch (error) {
    console.error('Error exporting CSV:', error)
    alert('Erro ao exportar dados')
  }
}
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-active > div,
.overlay-leave-active > div {
  transition: transform 0.3s ease;
}

.overlay-enter-from > div,
.overlay-leave-to > div {
  transform: scale(0.9);
}
</style>
