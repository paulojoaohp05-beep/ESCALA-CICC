import assert from 'node:assert/strict'
import test from 'node:test'
import { getCopomSchedule } from './copomSchedule.ts'

const scheduleOn = (year: number, month: number, day: number) => getCopomSchedule(new Date(year, month - 1, day))

test('aplica o ciclo COPOM completo a partir da data-base', () => {
  const expected = [
    { day: 'E', night: 'C' },
    { day: 'B', night: 'D' },
    { day: 'A', night: 'E' },
    { day: 'B', night: 'C' },
    { day: 'A', night: 'D' },
  ]
  expected.forEach((schedule, index) => assert.deepEqual(scheduleOn(2026, 9, index + 1), schedule))
})

test('reinicia o ciclo COPOM após o quinto dia', () => {
  assert.deepEqual(scheduleOn(2026, 9, 6), { day: 'E', night: 'C' })
})

test('mantém o ciclo na virada de setembro para outubro', () => {
  assert.deepEqual(scheduleOn(2026, 9, 29), { day: 'B', night: 'C' })
  assert.deepEqual(scheduleOn(2026, 9, 30), { day: 'A', night: 'D' })
  assert.deepEqual(scheduleOn(2026, 10, 1), { day: 'E', night: 'C' })
  assert.deepEqual(scheduleOn(2026, 10, 2), { day: 'B', night: 'D' })
  assert.deepEqual(scheduleOn(2026, 10, 3), { day: 'A', night: 'E' })
})

test('normaliza corretamente datas anteriores à data-base', () => {
  assert.deepEqual(scheduleOn(2026, 8, 31), { day: 'A', night: 'D' })
  assert.deepEqual(scheduleOn(2026, 8, 30), { day: 'B', night: 'C' })
})
