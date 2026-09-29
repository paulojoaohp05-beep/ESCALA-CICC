export type HolidayCategory = 'national' | 'state' | 'municipal'
export type Holiday = { date: Date; name: string; category: HolidayCategory }
export type OptionalDate = { date: Date; name: string }

const atNoon = (year: number, month: number, day: number) => new Date(year, month, day, 12)
const addDays = (date: Date, days: number) => atNoon(date.getFullYear(), date.getMonth(), date.getDate() + days)

export function getEasterDate(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return atNoon(year, month, day)
}

export function getHolidays(year: number): Holiday[] {
  const easter = getEasterDate(year)
  return [
    { date: atNoon(year, 0, 1), name: 'Confraternização Universal', category: 'national' },
    { date: atNoon(year, 0, 25), name: 'Aniversário da Cidade de São Paulo', category: 'municipal' },
    { date: addDays(easter, -2), name: 'Paixão de Cristo', category: 'municipal' },
    { date: atNoon(year, 3, 21), name: 'Tiradentes', category: 'national' },
    { date: atNoon(year, 4, 1), name: 'Dia do Trabalho', category: 'national' },
    { date: addDays(easter, 60), name: 'Corpus Christi', category: 'municipal' },
    { date: atNoon(year, 6, 9), name: 'Revolução Constitucionalista de 1932', category: 'state' },
    { date: atNoon(year, 8, 7), name: 'Independência do Brasil', category: 'national' },
    { date: atNoon(year, 9, 12), name: 'Nossa Senhora Aparecida', category: 'national' },
    { date: atNoon(year, 10, 2), name: 'Finados', category: 'national' },
    { date: atNoon(year, 10, 15), name: 'Proclamação da República', category: 'national' },
    { date: atNoon(year, 10, 20), name: 'Dia Nacional de Zumbi e da Consciência Negra', category: 'national' },
    { date: atNoon(year, 11, 25), name: 'Natal', category: 'national' },
  ]
}

export function getOptionalDates(year: number): OptionalDate[] {
  const easter = getEasterDate(year)
  return [
    { date: addDays(easter, -48), name: 'Carnaval' },
    { date: addDays(easter, -47), name: 'Carnaval' },
    { date: addDays(easter, -46), name: 'Quarta-feira de Cinzas' },
  ]
}

export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function getHoliday(date: Date) {
  const key = dateKey(date)
  return getHolidays(date.getFullYear()).find((holiday) => dateKey(holiday.date) === key) ?? null
}

export function getOptionalDate(date: Date) {
  const key = dateKey(date)
  return getOptionalDates(date.getFullYear()).find((item) => dateKey(item.date) === key) ?? null
}
