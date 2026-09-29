import assert from 'node:assert/strict'
import test from 'node:test'
import { dateKey, getHoliday, getHolidays, getOptionalDate } from './holidays.ts'
import { getCommemorativeDate } from './commemorativeDates.ts'

const on = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)

test('retorna feriados nacionais fixos', () => {
  assert.equal(getHoliday(on(2026, 1, 1))?.category, 'national')
  assert.equal(getHoliday(on(2026, 9, 7))?.name, 'Independência do Brasil')
  assert.equal(getHoliday(on(2026, 11, 20))?.category, 'national')
})

test('retorna feriado estadual e feriados municipais de São Paulo', () => {
  assert.equal(getHoliday(on(2026, 7, 9))?.category, 'state')
  assert.equal(getHoliday(on(2026, 1, 25))?.category, 'municipal')
  assert.equal(getHoliday(on(2026, 4, 3))?.name, 'Paixão de Cristo')
  assert.equal(getHoliday(on(2026, 6, 4))?.name, 'Corpus Christi')
})

test('calcula corretamente feriados móveis relacionados à Páscoa', () => {
  const holidays = getHolidays(2026)
  assert.ok(holidays.some((item) => dateKey(item.date) === '2026-04-03'))
  assert.ok(holidays.some((item) => dateKey(item.date) === '2026-06-04'))
  assert.equal(getCommemorativeDate(on(2026, 4, 5))?.name, 'Páscoa')
})

test('não classifica ponto facultativo ou data comemorativa como feriado', () => {
  assert.equal(getOptionalDate(on(2026, 2, 17))?.name, 'Carnaval')
  assert.equal(getHoliday(on(2026, 2, 17)), null)
  assert.equal(getCommemorativeDate(on(2026, 6, 12))?.name, 'Dia dos Namorados')
  assert.equal(getHoliday(on(2026, 6, 12)), null)
})
