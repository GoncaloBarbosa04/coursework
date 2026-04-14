export type Listing = {
  id: number
  name: string
  host_id: number
  host_name: string
  neighbourhood_group: string | null
  neighbourhood: string
  latitude: number
  longitude: number
  room_type: string
  price: number | null
  minimum_nights: number
  number_of_reviews: number
  last_review: string | null
  reviews_per_month: number
  calculated_host_listings_count: number
  availability_365: number
  number_of_reviews_ltm: number
  license: string
}

export type CityListings = {
  [cityName: string]: Listing[]
}

export type ListingDisplay = {
  id: number
  name: string
  host_name: string
  neighbourhood: string
  room_type: string
  price: number | null
  minimum_nights: number
  number_of_reviews: number
  last_review: string | null
  reviews_per_month: number
  availability_365: number
  license: string
  city: string
  latitude: number
  longitude: number
}
