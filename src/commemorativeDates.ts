import { dateKey, getEasterDate } from './holidays.ts'

export type CommemorativeDate = { date: Date; name: string }

const atNoon = (year: number, month: number, day: number) => new Date(year, month, day, 12)

function nthWeekday(year: number, month: number, weekday: number, occurrence: number) {
  const first = atNoon(year, month, 1)
  const day = 1 + ((weekday - first.getDay() + 7) % 7) + (occurrence - 1) * 7
  return atNoon(year, month, day)
}

export function getCommemorativeDates(year: number): CommemorativeDate[] {
  return [
    { date: atNoon(year, 2, 8), name: 'Dia Internacional da Mulher' },
    { date: getEasterDate(year), name: 'Páscoa' },
    { date: nthWeekday(year, 4, 0, 2), name: 'Dia das Mães' },
    { date: atNoon(year, 5, 12), name: 'Dia dos Namorados' },
    { date: nthWeekday(year, 7, 0, 2), name: 'Dia dos Pais' },
    { date: atNoon(year, 9, 12), name: 'Dia das Crianças' },
  ]
}

export function getCommemorativeDate(date: Date) {
  const key = dateKey(date)
  return getCommemorativeDates(date.getFullYear()).find((item) => dateKey(item.date) === key) ?? null
}
