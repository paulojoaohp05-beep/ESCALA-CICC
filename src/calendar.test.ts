import assert from 'node:assert/strict'
import test from 'node:test'
import { getCalendarDays } from './schedule.ts'

const monthLength = (year: number, month: number) => getCalendarDays(year, month).filter((date) => date.getFullYear() === year && date.getMonth() === month).length

test('calendário respeita anos bissextos gregorianos', () => {
  assert.equal(monthLength(2027, 1), 28)
  assert.equal(monthLength(2028, 1), 29)
  assert.equal(monthLength(2100, 1), 28)
  assert.equal(monthLength(2400, 1), 29)
})

test('transições de fevereiro são preservadas', () => {
  assert.equal(new Date(2027, 1, 28 + 1).toISOString().slice(0, 10), '2027-03-01')
  assert.equal(new Date(2028, 1, 28 + 1).toISOString().slice(0, 10), '2028-02-29')
  assert.equal(new Date(2028, 1, 29 + 1).toISOString().slice(0, 10), '2028-03-01')
})
