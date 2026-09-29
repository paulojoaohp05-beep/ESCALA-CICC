import assert from 'node:assert/strict'
import test from 'node:test'
import { getGroupForDate, type Group } from './schedule.ts'

const groupOn = (year: number, month: number, day: number) => getGroupForDate(new Date(year, month - 1, day))

test('aplica a sequência A gorda na semana-base', () => {
  const expected: Group[] = ['A', 'B', 'A', 'B', 'A', 'A', 'A']
  expected.forEach((group, index) => assert.equal(groupOn(2026, 9, 28 + index), group))
})

test('inverte completamente os grupos na semana seguinte', () => {
  const expected: Group[] = ['B', 'A', 'B', 'A', 'B', 'B', 'B']
  expected.forEach((group, index) => assert.equal(groupOn(2026, 10, 5 + index), group))
})

test('alterna corretamente também nas semanas anteriores à base', () => {
  const expected: Group[] = ['B', 'A', 'B', 'A', 'B', 'B', 'B']
  expected.forEach((group, index) => assert.equal(groupOn(2026, 9, 21 + index), group))
})

test('corresponde à validação completa de setembro de 2026', () => {
  const expected: Group[] = [
    'B', 'A', 'B', 'A', 'A', 'A', 'B', 'A', 'B', 'A',
    'B', 'B', 'B', 'A', 'B', 'A', 'B', 'A', 'A', 'A',
    'B', 'A', 'B', 'A', 'B', 'B', 'B', 'A', 'B', 'A',
  ]
  const actual = Array.from({ length: 30 }, (_, index) => groupOn(2026, 9, index + 1))
  assert.deepEqual(actual, expected)
})
