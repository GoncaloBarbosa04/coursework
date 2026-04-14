import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStorage = defineStore('session', () => {
  const selected_city = ref('')
  const selected_neighbourhood = ref('Todas')
  const selected_year = ref('Todas')
  const selected_property = ref('Todas')
  
  
  const currentView = ref('Gerais')

  function setCity(city: string) { selected_city.value = city }
  function setNeighbourhood(n: string) { selected_neighbourhood.value = n }
  function setYear(y: string) { selected_year.value = y }
  function setProperty(p: string) { selected_property.value = p }
  
  
  function setView(view: string) { currentView.value = view }

  function exitHome() {
    selected_city.value = ''
    selected_neighbourhood.value = 'Todas'
    selected_year.value = 'Todas'
    selected_property.value = 'Todas'
    currentView.value = 'Gerais'
  }

  return {
    selected_city,
    selected_neighbourhood,
    selected_year,
    selected_property,
    currentView, 
    setCity,
    setNeighbourhood,
    setYear,
    setProperty,
    setView,     
    exitHome,
  }
})