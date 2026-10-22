// Single source of truth for HR Evolve chapter cities. Values match the Prisma `City` enum.
// Safe to import from both client and server code.

export const CITY_VALUES = ['TRIVANDRUM', 'KOCHI', 'KOZHIKODE'] as const

export type CityValue = (typeof CITY_VALUES)[number]

export interface CityInfo {
  value: CityValue
  label: string
  slug: string
  tagline: string
  image: string
}

export const CITIES: CityInfo[] = [
  {
    value: 'TRIVANDRUM',
    label: 'Trivandrum',
    slug: 'trivandrum',
    tagline: 'Where HR Evolve began - the home of Elevate.',
    image: '/s1.jpg',
  },
  {
    value: 'KOCHI',
    label: 'Kochi',
    slug: 'kochi',
    tagline: "People leaders from Kerala's business capital.",
    image: '/s2.jpg',
  },
  {
    value: 'KOZHIKODE',
    label: 'Kozhikode',
    slug: 'kozhikode',
    tagline: 'Bringing the HR conversation to Malabar.',
    image: '/s3.jpg',
  },
]

export const CITY_LABELS: Record<string, string> = Object.fromEntries(
  CITIES.map((c) => [c.value, c.label])
)

export function isValidCity(value: unknown): value is CityValue {
  return typeof value === 'string' && (CITY_VALUES as readonly string[]).includes(value)
}

export function getCityBySlug(slug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug)
}
