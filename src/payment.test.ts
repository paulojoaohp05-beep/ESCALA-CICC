import assert from 'node:assert/strict'
import test from 'node:test'
import { getFifthBusinessDay, isBusinessDay } from './payment.ts'
import type { Holiday } from './holidays.ts'

const holiday = (year: number, month: number, day: number): Holiday => ({ date: new Date(year, month - 1, day, 12), name: 'Feriado de teste', category: 'municipal' })
const day = (date: Date) => date.getDate()

test('calcula mês começando segunda-feira', () => assert.equal(day(getFifthBusinessDay(2024, 0, [])), 5))
test('calcula mês começando sexta-feira', () => assert.equal(day(getFifthBusinessDay(2021, 0, [])), 7))
test('calcula mês começando sábado', () => assert.equal(day(getFifthBusinessDay(2022, 0, [])), 7))
test('calcula mês começando domingo', () => assert.equal(day(getFifthBusinessDay(2023, 0, [])), 6))

test('ignora um feriado na primeira semana', () => {
  assert.equal(day(getFifthBusinessDay(2024, 0, [holiday(2024, 1, 3)])), 8)
})

test('ignora mais de um feriado antes do quinto dia útil', () => {
  assert.equal(day(getFifthBusinessDay(2024, 0, [holiday(2024, 1, 2), holiday(2024, 1, 4)])), 9)
})

test('sábado e domingo nunca contam', () => {
  assert.equal(isBusinessDay(new Date(2024, 0, 6, 12), []), false)
  assert.equal(isBusinessDay(new Date(2024, 0, 7, 12), []), false)
})

test('feriado no sábado ou domingo não desloca a contagem', () => {
  const baseline = getFifthBusinessDay(2024, 0, [])
  const withWeekendHolidays = getFifthBusinessDay(2024, 0, [holiday(2024, 1, 6), holiday(2024, 1, 7)])
  assert.equal(day(withWeekendHolidays), day(baseline))
})

test('funciona em fevereiro de ano bissexto', () => {
  assert.equal(day(getFifthBusinessDay(2028, 1, [])), 7)
})
