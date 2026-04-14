// parser.ts
// This script reads db.json and generates a filters.ts file
// containing aggregated filters per city for use in a Vue application

import * as fs from 'fs'
import * as path from 'path'
// Use process.cwd() to avoid ES Module __dirname issues
// Path resolution (ESM-safe, no __dirname)
const dbPathCandidates = [
  path.resolve(process.cwd(), 'db.json'),
  path.resolve(process.cwd(), 'src/db.json'),
]

const dbPath = dbPathCandidates.find((p) => fs.existsSync(p))

if (!dbPath) {
  throw new Error('db.json not found. Place it in project root or src folder.')
}

const outputPath = path.resolve(process.cwd(), 'src/filters.ts')
// Removed: ;(__dirname, 'filters.ts')

function extractYear(date: string | null): number | null {
  if (!date) return null
  const match = date.match(/^\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function generateFilters() {
  const raw = fs.readFileSync(dbPath, 'utf-8')
  const db: DbData = JSON.parse(raw)

  const result: Record<string, CityFilters> = {}

  for (const city in db.data) {
    const listings = db.data[city]

    const neighbourhoods: string[] = []
    const years: number[] = []
    const propertyTypes: string[] = []

    listings.forEach((listing) => {
      const nGroup = listing.neighbourhood_group
      if (nGroup) {
        neighbourhoods.push(nGroup)
      } else if (listing.neighbourhood) {
        neighbourhoods.push(listing.neighbourhood)
      }

      const year = extractYear(listing.last_review)
      if (year) years.push(year)

      if (listing.room_type) propertyTypes.push(listing.room_type)
    })

    result[city] = {
      neighbourhoods: unique(neighbourhoods).sort(),
      years: unique(years).sort(),
      property_types: unique(propertyTypes).sort(),
    }
  }

  const fileContent = `// AUTO-GENERATED FILE - DO NOT EDIT
export const filters = ${JSON.stringify(result, null, 2)} as const;\n`

  fs.writeFileSync(outputPath, fileContent, 'utf-8')
}

generateFilters()

console.log('filters.ts generated successfully ✅')
