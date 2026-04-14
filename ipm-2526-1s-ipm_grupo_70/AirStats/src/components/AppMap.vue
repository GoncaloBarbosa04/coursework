<template>
    <div class="w-full h-full rounded-2xl overflow-hidden shadow-inner relative z-0">
      <l-map 
        ref="mapRef" 
        v-model:zoom="zoom" 
        :center="center" 
        :use-global-leaflet="false"
        :options="{ scrollWheelZoom: false }"
      >
        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          layer-type="base"
          name="CartoDB Light"
        ></l-tile-layer>
  
        <l-geo-json 
          v-if="geoJsonData"
          :key="componentKey"
          :geojson="geoJsonData" 
          :options-style="styleFunction"
          :options="{ onEachFeature: onEachFeature }"
        />
      </l-map>
  
      <div class="absolute bottom-5 right-5 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg text-xs z-[1000] border border-gray-100">
         <div class="font-bold text-gray-600 mb-2">Densidade</div>
         <div class="flex items-center gap-2 mb-1"><span class="w-4 h-4 rounded bg-[#800026]"></span> > 50</div>
         <div class="flex items-center gap-2 mb-1"><span class="w-4 h-4 rounded bg-[#E31A1C]"></span> 20 - 50</div>
         <div class="flex items-center gap-2 mb-1"><span class="w-4 h-4 rounded bg-[#FD8D3C]"></span> 10 - 20</div>
         <div class="flex items-center gap-2 mb-1"><span class="w-4 h-4 rounded bg-[#FEB24C]"></span> 5 - 10</div>
         <div class="flex items-center gap-2 mb-1"><span class="w-4 h-4 rounded bg-[#FFEDA0]"></span> 1 - 5</div>
         <div class="flex items-center gap-2"><span class="w-4 h-4 rounded border border-gray-300 bg-transparent"></span> 0 / Sem dados</div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import 'leaflet/dist/leaflet.css'
  import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
  
  const props = defineProps<{
    geoJsonData?: any       
    zoneData?: Record<string, number> 
    centerCoords?: [number, number]
  }>()
  
  const zoom = ref(12)
  const center = ref<[number, number]>([38.7223, -9.1393])
  
  const componentKey = computed(() => {
    return `geo-${props.geoJsonData ? 'loaded' : 'empty'}-${Object.keys(props.zoneData || {}).length}`
  })
  
  watch(() => props.centerCoords, (newCoords) => {
    if (newCoords && newCoords.length === 2) {
      center.value = newCoords
      zoom.value = 12
    }
  }, { immediate: true })
  
  function normalize(str: string) {
    if (!str) return ''
    return str.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }
  
  function getColor(d: number) {
    return d > 50  ? '#800026' : 
           d > 20  ? '#E31A1C' : 
           d > 10  ? '#FD8D3C' : 
           d > 5   ? '#FEB24C' : 
           d > 0   ? '#FFEDA0' : 
                     'transparent';
  }
  
  const styleFunction = (feature: any) => {
    const zoneNameGeo = feature.properties.name || feature.properties.Freguesia || feature.properties.Concelho || feature.properties.neighbourhood
    
    let count = 0
    
    if (props.zoneData && zoneNameGeo) {
      if (props.zoneData[zoneNameGeo]) {
        count = props.zoneData[zoneNameGeo]
      } else {
        const normalizedGeoName = normalize(zoneNameGeo)
        const matchKey = Object.keys(props.zoneData).find(apiKey => normalize(apiKey) === normalizedGeoName)
        if (matchKey) {
          count = props.zoneData[matchKey]
        }
      }
    }
  
    // --- DEBUG NA CONSOLA ---
    // Abre o F12 e vê se aparecem estes logs. Se count for 0, o nome não bateu certo ou não há dados.
    if (count > 0) {
      // console.log(`✅ A PINTAR: ${zoneNameGeo} com valor ${count}`)
    } else {
      // console.log(`⚪ VAZIO: ${zoneNameGeo} (Dados: ${count})`)
    }
  
    return { 
      fillColor: getColor(count), 
      weight: 1, 
      opacity: 1, 
      color: '#666', 
      dashArray: '3', 
      fillOpacity: count > 0 ? 0.7 : 0.1 
    }
  }
  
  const onEachFeature = (feature: any, layer: any) => {
    const zoneName = feature.properties.name || feature.properties.Freguesia || 'Zona desconhecida'
    
    let count = 0
    if (props.zoneData) {
       if (props.zoneData[zoneName]) count = props.zoneData[zoneName]
       else {
         const match = Object.keys(props.zoneData).find(k => normalize(k) === normalize(zoneName))
         if (match) count = props.zoneData[match]
       }
    }
    
    layer.bindTooltip(`
      <div class="text-center min-w-[100px]">
        <div class="font-bold text-sm mb-1">${zoneName}</div>
        <div class="text-xs ${count > 0 ? 'text-green-600 font-bold' : 'text-gray-400'}">
          ${count > 0 ? count + ' registos' : 'Sem dados'}
        </div>
      </div>
    `, { sticky: true, direction: 'top' })
  }
  </script>