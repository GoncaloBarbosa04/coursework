<template>
  <div class="bg-blue w-full min-h-screen flex items-center justify-center">
    <div class="flex flex-col w-3xl gap-y-8">
      <img src="../assets/airStatsLogo.svg" alt="AirStats logo" class="h-30" />
      <div class="bg-white flex flex-col justify-evenly h-90 w-full rounded-2xl p-10">
        <div class="flex flex-2 items-center justify-between">
          <p class="text-dark-gray font-bold text-2xl">Escolhe uma cidade</p>

          <p v-if="errorMessage" class="text-red-500 text-md text-right">
            {{ errorMessage }}
          </p>
        </div>

        <div class="bg-[#E9E9E9] h-12 rounded-xl w-full flex items-center p-2 gap-x-4">
          <img src="../assets/searchIcon.svg" alt="search icon" class="h-7" />
          <div class="relative flex w-full">
            <p class="absolute left-2 text-dark-gray pointer-events-none">
              {{ selected_city }}
            </p>
            <input
              class="w-full bg-transparent border-none outline-none text-transparent caret-dark-gray px-2"
              v-model="selected_city"
            />
          </div>
        </div>

        <!-- Suggestions List -->
        <div class="h-40 flex flex-col justify-evenly">
          <p class="text-dark-gray text-sm py-2 block place-self-start">Sugestões:</p>
          <ul class="flex flex-wrap gap-x-6 w-full gap-y-4">
            <li v-for="city in sugestions" :key="city.name">
              <button
                class="bg-pink/50 text-white px-4 py-1 rounded-2xl cursor-pointer hover:opacity-80"
                @click="selectSuggestion(city.name)"
              >
                {{ city.name }}
              </button>
            </li>

            <button
              class="bg-orange text-white font-medium rounded-lg text-xl w-30 py-2 ml-auto cursor-pointer hover:opacity-80"
              @click="goToStatistics"
            >
              Avançar
            </button>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStorage } from '@/stores/session.ts'
import { filters } from '../filters'

const session = useSessionStorage()
const router = useRouter()

const selected_city = ref('')
const errorMessage = ref('')

const sugestions = Object.keys(filters).map((city) => ({ name: city }))

function selectSuggestion(cityName: string) {
  selected_city.value = cityName
  errorMessage.value = '' // clear error when selecting a suggestion
}

function goToStatistics() {
  if (!selected_city.value.trim()) {
    errorMessage.value = 'Por favor, escolha uma cidade'
    return
  }

  const exists = sugestions.find(
    (city) => city.name.toLowerCase() === selected_city.value.toLowerCase(),
  )

  if (exists) {
    selected_city.value = exists.name
    session.setCity(selected_city.value)
    router.push('/Statistics')
  } else {
    errorMessage.value = 'Escolha uma cidade disponível nas sugestões'
  }
}
</script>
