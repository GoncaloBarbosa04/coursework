import axios from 'axios'
import { useSessionStorage } from './stores/session'
import * as types from './types'

const API = axios.create({
  baseURL: 'http://localhost:3000',
})

// Add response interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log('📡 Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

API.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, '- Status:', response.status)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.config?.url, error.response?.status)
    return Promise.reject(error)
  },
)

export async function list_AllListings() {
  // GET /data returns array of city objects with reservations
  const response = await API.get('/data')
  const cityData = response.data

  const display: types.ListingDisplay[] = []

  cityData.forEach((cityObj: any) => {
    const cityName = cityObj.id
    const reservations = cityObj.reservations || []

    reservations.forEach((listing: any) => {
      display.push({
        ...listing,
        city: cityName,
      })
    })
  })

  console.log('📊 Total listings across all cities:', display.length)
  return display
}

export async function list_ListingsByCity(city: string) {
  // GET /data?id=CityName to get specific city
  const response = await API.get('/data', {
    params: { id: city },
  })

  console.log('🔍 Looking for city:', city)

  // Response is an array with one city object
  const cityData = response.data[0]

  if (!cityData || !cityData.reservations) {
    console.log('📋 No data found for', city)
    return []
  }

  const listings = cityData.reservations.map((listing: any) => ({
    ...listing,
    city: cityData.id,
  }))

  console.log('📋 Found listings for', city, ':', listings.length)
  return listings
}

export async function get_Listing(city: string, id: number) {
  // Get all listings for the city and find by id
  const listings = await list_ListingsByCity(city)
  const listing = listings.find((l) => l.id === id)

  if (!listing) {
    throw new Error(`Listing with id ${id} not found in ${city}`)
  }

  return listing
}

export async function list_Cities() {
  const response = await API.get('/data')
  const cityData = response.data

  const cities = cityData.map((cityObj: any) => cityObj.id)

  console.log('🌍 Available cities:', cities)
  return cities
}

// Search functions
export async function search_ListingsByPrice(maxPrice: number, city?: string) {
  const allListings = city ? await list_ListingsByCity(city) : await list_AllListings()
  return allListings.filter((listing) => listing.price !== null && listing.price <= maxPrice)
}

export async function search_ListingsByNeighbourhood(neighbourhood: string, city?: string) {
  const allListings = city ? await list_ListingsByCity(city) : await list_AllListings()
  return allListings.filter((listing) =>
    listing.neighbourhood.toLowerCase().includes(neighbourhood.toLowerCase()),
  )
}

export async function search_ListingsByHost(hostName: string, city?: string) {
  const allListings = city ? await list_ListingsByCity(city) : await list_AllListings()
  return allListings.filter((listing) =>
    listing.host_name.toLowerCase().includes(hostName.toLowerCase()),
  )
}

function applyFilters(listings: any[]) {
  const session = useSessionStorage()

  return listings.filter((l) => {
    if (session.selected_neighbourhood && session.selected_neighbourhood !== 'Todas') {
      const matchNeighbourhood =
        l.neighbourhood === session.selected_neighbourhood ||
        l.neighbourhood_group === session.selected_neighbourhood

      if (!matchNeighbourhood) return false
    }

    if (session.selected_year && session.selected_year !== 'Todas' && l.last_review) {
      const year = new Date(l.last_review).getFullYear()
      if (year !== Number(session.selected_year)) return false
    }

    return true
  })
}

export async function getDashboardStats() {
  const session = useSessionStorage()
  const city = session.selected_city

  if (!city) return null

  const listings = await list_ListingsByCity(city)

  const filtered = applyFilters(listings)

  const shortTerm = filtered.filter((r) => r.minimum_nights <= 30).length
  const longTerm = filtered.filter((r) => r.minimum_nights > 30).length

  const pricesPerNight = filtered.map((r) => (r.price != null ? r.price : 0))
  const totalPrice = pricesPerNight.reduce((sum, p) => sum + p, 0)
  const averagePrice = filtered.length > 0 ? totalPrice / filtered.length : 0

  return {
    city,
    totalReservations: filtered.length,
    shortTermReservations: shortTerm,
    longTermReservations: longTerm,
    averagePrice: Math.round(averagePrice),
  }
}

export async function getReservationsByPropertyType(): Promise<
  {
    property_type: string
    reservations: number
    average_price: number
    percentage: number
  }[]
> {
  const session = useSessionStorage()
  const city = session.selected_city

  console.log('🏠 getReservationsByPropertyType called with:', {
    city,
    neighbourhood: session.selected_neighbourhood,
    year: session.selected_year,
  })

  // Load listings based on city selection
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()

  // Use the shared filter function so behaviour matches the dashboard
  const filtered = applyFilters(listings)

  // If nothing after filtering, return zeros for each known type
  const propertyTypes: Record<
    string,
    { name: string; listingsCount: number; pricesSum: number; pricesCount: number }
  > = {
    'Entire home/apt': { name: 'Alojamento Local', listingsCount: 0, pricesSum: 0, pricesCount: 0 },
    'Hotel room': { name: 'Hotel', listingsCount: 0, pricesSum: 0, pricesCount: 0 },
    'Private room': { name: 'Quarto Privado', listingsCount: 0, pricesSum: 0, pricesCount: 0 },
    'Shared room': { name: 'Quarto Partilhado', listingsCount: 0, pricesSum: 0, pricesCount: 0 },
  }

  // Aggregate
  filtered.forEach((listing) => {
    const type = listing.room_type
    const bucket = propertyTypes[type]
    if (!bucket) return

    // Count the listing object as 1 reservation (per your UI)
    bucket.listingsCount += 1

    // Accumulate nightly price for average; treat null as 0 but still count it
    const price = listing.price ?? 0
    bucket.pricesSum += price
    bucket.pricesCount += 1
  })

  // Compute totals for percentages
  const totalListings = Object.values(propertyTypes).reduce((s, b) => s + b.listingsCount, 0) || 1

  // Build result array in the same order your front-end expects (optional)
  const result = Object.keys(propertyTypes).map((key) => {
    const b = propertyTypes[key]
    const avg = b.pricesCount > 0 ? Math.round(b.pricesSum / b.pricesCount) : 0

    return {
      property_type: key, // e.g. "Entire home/apt" — frontend maps to Portuguese via TYPE_MAP
      reservations: b.listingsCount,
      average_price: avg,
      percentage: Math.round((b.listingsCount / totalListings) * 1000) / 10, // 1 decimal, e.g. 12.3
    }
  })

  console.log('🏠 Property type data:', result)
  return result
}

export async function getReservationsByPropertyTypeAndPriceRange(
  minPrice: number,
  maxPrice: number,
): Promise<
  {
    propertyType: string
    reservations: number
  }[]
> {
  const session = useSessionStorage()
  const city = session.selected_city

  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()

  const filtered = applyFilters(listings)

  const priceFiltered = filtered.filter((listing) => {
    const price = listing.price ?? 0
    return price >= minPrice && price < maxPrice
  })

  console.log('📊 Listings in price range:', priceFiltered.length)

  const propertyTypes = {
    'Entire home/apt': { name: 'Alojamento Local', reservations: 0 },
    'Hotel room': { name: 'Hotel', reservations: 0 },
    'Private room': { name: 'Quarto Privado', reservations: 0 },
    'Shared room': { name: 'Quarto Partilhado', reservations: 0 },
  } as any

  priceFiltered.forEach((listing) => {
    const type = listing.room_type
    if (propertyTypes[type]) {
      propertyTypes[type].reservations += 1
    }
  })

  // Return clean result structure
  return Object.keys(propertyTypes).map((type) => ({
    propertyType: propertyTypes[type].name,
    reservations: propertyTypes[type].reservations,
  }))
}

export interface PropertyTypeStats {
  property_type: string
  reservations: number
  percentage: number
}

export async function getMonthlyReservationsByPropertyType(propertyType: string) {
  const session = useSessionStorage()
  const city = session.selected_city

  // 1. Load listings normally (city or all)
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()

  // 2. Apply global filters (city, neighbourhood, year)
  const filteredListings = applyFilters(listings)

  // 3. Filter by property type
  const listingsOfType = filteredListings.filter((l: any) => l.room_type === propertyType)

  // 4. Monthly counters (0-11)
  const monthlyTotals = Array(12).fill(0)

  // 5. Count 1 reservation per listing in the month of last_review
  listingsOfType.forEach((listing) => {
    if (!listing.last_review) return
    const date = new Date(listing.last_review)
    if (isNaN(date.getTime())) return
    const month = date.getMonth()
    monthlyTotals[month]++
  })

  return monthlyTotals
}



/**
 * 1. Calcular Centro da Cidade (Média das coordenadas)
 */
export async function getCityCenterCoordinates(city: string): Promise<[number, number]> {
  try {
    const listings = await list_ListingsByCity(city)
    if (!listings || listings.length === 0) return [38.7223, -9.1393] // Default Lisboa

    let latSum = 0, lonSum = 0, count = 0
    listings.forEach((l: any) => {
      if (l.latitude && l.longitude) {
        latSum += Number(l.latitude)
        lonSum += Number(l.longitude)
        count++
      }
    })

    if (count === 0) return [38.7223, -9.1393]
    return [latSum / count, lonSum / count]
  } catch (e) {
    console.error("Erro ao calcular centro:", e)
    return [38.7223, -9.1393]
  }
}

/**
 * 2. Dados para pintar o Mapa (Agregação por Zona)
 */
export async function getIrregularitiesByNeighbourhood() {
  const session = useSessionStorage()
  const city = session.selected_city
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()
  const filtered = applyFilters(listings)

  const counts: Record<string, number> = {}

  filtered.forEach((l: any) => {
    const zone = l.neighbourhood || l.neighbourhood_cleansed || l.neighbourhood_group
    if (zone) {
      counts[zone] = (counts[zone] || 0) + 1
    }
  })
  return counts
}

/**
 * 3. Estatísticas de Anomalias (Cards Cinzentos)
 */
export async function getIrregularityStats() {
  const session = useSessionStorage()
  const city = session.selected_city
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()
  const filtered = applyFilters(listings)

  // Lógica de exemplo para anomalias
  const noLicenseCount = filtered.filter((l: any) => !l.license || l.license === "").length
  const multiHostCount = filtered.filter((l: any) => l.calculated_host_listings_count > 1).length
  const priceAnomaliesCount = filtered.filter((l: any) => (l.price || 0) > 500).length
  const excessiveOccupancyCount = filtered.filter((l: any) => 
    (l.availability_365 || 0) < 60 && (l.number_of_reviews || 0) > 20
  ).length

  return {
    excessiveOccupancy: excessiveOccupancyCount,
    priceAnomalies: priceAnomaliesCount,
    noLicense: noLicenseCount,
    multipleListings: multiHostCount,
    total: filtered.length
  }
}

/**
 * 4. Estatísticas de Licenças
 */
export async function getLicenseStats() {
  const session = useSessionStorage()
  const city = session.selected_city
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()
  const filtered = applyFilters(listings)

  const noLicense = filtered.filter((l: any) => !l.license || l.license === "").length
  const exempt = filtered.filter((l: any) => l.license && l.license.toLowerCase().includes('exempt')).length
  const withLicense = filtered.length - noLicense - exempt

  return { withLicense, withoutLicense: noLicense, exempt, total: filtered.length }
}

/**
 * 5. Top Listings (Tabela AL)
 */
export async function getTopListingsData() {
  const session = useSessionStorage()
  const city = session.selected_city
  const listings = city ? await list_ListingsByCity(city) : await list_AllListings()
  const filtered = applyFilters(listings)

  return filtered
    .sort((a: any, b: any) => (b.price || 0) - (a.price || 0))
    .slice(0, 50)
    .map((l: any) => ({
      id: l.id,
      name: l.name,
      price: l.price,
      occupancy: l.availability_365 ? Math.round(((365 - l.availability_365) / 365) * 100) : 0
    }))
}


export async function getCityComparisonStats(cityName: string, yearFilter: string, propertyFilter: string) {
  const listings = await list_ListingsByCity(cityName)

  // Mapa para converter os nomes da sidebar para os tipos da BD
  const typeMap: Record<string, string> = {
      'Alojamento Local': 'Entire home/apt',
      'Hotel': 'Hotel room',
      'Quarto Privado': 'Private room',
      'Quarto Partilhado': 'Shared room'
  }
  const dbPropertyType = typeMap[propertyFilter]

  // 2. Filtrar por ANO e PROPRIEDADE
  const filtered = listings.filter((l: any) => {
    // Filtro de Ano
    if (yearFilter && yearFilter !== 'Todas' && l.last_review) {
       if (!l.last_review.startsWith(yearFilter)) return false
    }
    
    // Filtro de Propriedade (Novo)
    if (propertyFilter && propertyFilter !== 'Todas' && dbPropertyType) {
        if (l.room_type !== dbPropertyType) return false
    }

    return true
  })

  if (filtered.length === 0) {
    return { totalListings: 0, averagePrice: 0, quarterlyReservations: [0, 0, 0, 0], quarterlyPrices: [0, 0, 0, 0] }
  }

  // 3. Totais Simples
  const totalPrice = filtered.reduce((sum: number, l: any) => sum + (l.price || 0), 0)
  const averagePrice = Math.round(totalPrice / filtered.length)

  // 4. Calcular Trimestres
  const qReservations = [0, 0, 0, 0]
  const qPricesSum = [0, 0, 0, 0]
  const qPricesCount = [0, 0, 0, 0]

  filtered.forEach((l: any) => {
    if (!l.last_review) return
    const month = new Date(l.last_review).getMonth()
    const quarter = Math.floor(month / 3)
    
    qReservations[quarter]++
    qPricesSum[quarter] += (l.price || 0)
    qPricesCount[quarter]++
  })

  const qPricesAvg = qPricesSum.map((sum, i) => qPricesCount[i] > 0 ? Math.round(sum / qPricesCount[i]) : 0)

  return { totalListings: filtered.length, averagePrice, quarterlyReservations: qReservations, quarterlyPrices: qPricesAvg }
}