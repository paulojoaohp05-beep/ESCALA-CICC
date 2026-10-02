import { dateKey, getEasterDate, getHolidays, getOptionalDates, type Holiday, type HolidayCategory } from './holidays.ts'

export type BrasilApiHoliday = { date: string; name: string; type: string }
type Fetcher = typeof fetch
type FetchOptions = { fetcher?: Fetcher; timeoutMs?: number }

const cache = new Map<number, Promise<Holiday[]>>()
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function parseCategory(type: string): Exclude<HolidayCategory, 'municipal'> | null {
  const normalized = type.trim().toLowerCase()
  if (normalized === 'national' || normalized === 'nacional') return 'national'
  if (normalized === 'state' || normalized === 'estadual') return 'state'
  return null
}

export function normalizeBrasilApiHolidays(data: unknown, year: number): Holiday[] {
  if (!Array.isArray(data)) return []

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const { date, name, type } = item as Partial<BrasilApiHoliday>
    if (typeof date !== 'string' || typeof name !== 'string' || typeof type !== 'string' || !name.trim()) return []
    const match = DATE_PATTERN.exec(date)
    const category = parseCategory(type)
    if (!match || !category || Number(match[1]) !== year) return []
    const month = Number(match[2])
    const day = Number(match[3])
    const parsed = new Date(year, month - 1, day, 12)
    if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return []
    return [{ date: parsed, name: name.trim(), category }]
  })
}

export async function fetchBrasilApiHolidays(year: number, { fetcher = fetch, timeoutMs = 4_000 }: FetchOptions = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetcher(`https://brasilapi.com.br/api/feriados/v1/${year}?uf=SP`, { signal: controller.signal })
    if (!response.ok) throw new Error(`BrasilAPI retornou ${response.status}`)
    return normalizeBrasilApiHolidays(await response.json(), year)
  } finally {
    clearTimeout(timeout)
  }
}

export function mergeHolidays(apiHolidays: Holiday[], localHolidays: Holiday[]) {
  const year = localHolidays[0]?.date.getFullYear() ?? apiHolidays[0]?.date.getFullYear()
  const municipalDates = new Set(localHolidays.filter((holiday) => holiday.category === 'municipal').map((holiday) => dateKey(holiday.date)))
  const optionalDates = new Set(year === undefined ? [] : getOptionalDates(year).map((item) => dateKey(item.date)))
  const easterKey = year === undefined ? '' : dateKey(getEasterDate(year))
  const trustedApi = apiHolidays.filter((holiday) => !municipalDates.has(dateKey(holiday.date)) && !optionalDates.has(dateKey(holiday.date)) && dateKey(holiday.date) !== easterKey)
  const apiStateDates = new Set(trustedApi.filter((holiday) => holiday.category === 'state').map((holiday) => dateKey(holiday.date)))
  const localRequired = localHolidays.filter((holiday) => holiday.category === 'municipal' || (holiday.category === 'state' && !apiStateDates.has(dateKey(holiday.date))))
  const merged = new Map<string, Holiday>()
  for (const holiday of [...trustedApi, ...localRequired]) {
    const key = `${dateKey(holiday.date)}|${holiday.name.trim().toLocaleLowerCase('pt-BR')}`
    if (!merged.has(key)) merged.set(key, holiday)
  }
  return [...merged.values()].sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name, 'pt-BR'))
}

async function loadHolidaysForYear(year: number, options?: FetchOptions) {
  const local = getHolidays(year)
  try {
    const api = await fetchBrasilApiHolidays(year, options)
    if (api.length === 0) return local
    return mergeHolidays(api, local)
  } catch {
    return local
  }
}

export function getHolidaysForYear(year: number, options?: FetchOptions) {
  if (options?.fetcher || options?.timeoutMs !== undefined) return loadHolidaysForYear(year, options)
  const cached = cache.get(year)
  if (cached) return cached
  const request = loadHolidaysForYear(year)
  cache.set(year, request)
  return request
}

export function clearHolidayCache() {
  cache.clear()
}
