import assert from 'node:assert/strict'
import test from 'node:test'
import { getCopomSchedule } from './copomSchedule.ts'

const scheduleOn = (year: number, month: number, day: number) => getCopomSchedule(new Date(year, month - 1, day))

test('aplica o ciclo COPOM completo a partir da data-base', () => {
  const expected = [
    { day: 'BORGES', night: 'PANDORI' },
    { day: 'HONORATO', night: 'MACHADO' },
    { day: 'SENA', night: 'BORGES' },
    { day: 'HONORATO', night: 'PANDORI' },
    { day: 'SENA', night: 'MACHADO' },
  ]
  expected.forEach((schedule, index) => assert.deepEqual(scheduleOn(2026, 9, index + 1), schedule))
})

test('reinicia o ciclo COPOM após o quinto dia', () => {
  assert.deepEqual(scheduleOn(2026, 9, 6), { day: 'BORGES', night: 'PANDORI' })
})

test('mantém o ciclo na virada de setembro para outubro', () => {
  assert.deepEqual(scheduleOn(2026, 9, 29), { day: 'HONORATO', night: 'PANDORI' })
  assert.deepEqual(scheduleOn(2026, 9, 30), { day: 'SENA', night: 'MACHADO' })
  assert.deepEqual(scheduleOn(2026, 10, 1), { day: 'BORGES', night: 'PANDORI' })
  assert.deepEqual(scheduleOn(2026, 10, 2), { day: 'HONORATO', night: 'MACHADO' })
  assert.deepEqual(scheduleOn(2026, 10, 3), { day: 'SENA', night: 'BORGES' })
})

test('normaliza corretamente datas anteriores à data-base', () => {
  assert.deepEqual(scheduleOn(2026, 8, 31), { day: 'SENA', night: 'MACHADO' })
  assert.deepEqual(scheduleOn(2026, 8, 30), { day: 'HONORATO', night: 'PANDORI' })
})
