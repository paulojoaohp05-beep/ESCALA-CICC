import { dateKey, getHolidays, type Holiday } from './holidays.ts'

export function isBusinessDay(date: Date, holidays: Holiday[]) {
  const weekday = date.getDay()
  if (weekday === 0 || weekday === 6) return false
  const key = dateKey(date)
  return !holidays.some((holiday) => dateKey(holiday.date) === key)
}

export function getFifthBusinessDay(year: number, month: number, holidays = getHolidays(year)) {
  let count = 0
  const lastDay = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day, 12)
    if (!isBusinessDay(date, holidays)) continue
    count += 1
    if (count === 5) return date
  }

  throw new Error('Não foi possível determinar o quinto dia útil')
}
