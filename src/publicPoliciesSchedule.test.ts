import assert from 'node:assert/strict'
import test from 'node:test'
import { getPublicPoliciesOfficer } from './publicPoliciesSchedule.ts'

const officerOn = (year: number, month: number, day: number) => getPublicPoliciesOfficer(new Date(year, month - 1, day))

test('alterna Políticas Públicas a partir da data-base', () => {
  assert.equal(officerOn(2026, 9, 29), 'Câmara')
  assert.equal(officerOn(2026, 9, 30), 'Thamiris')
  assert.equal(officerOn(2026, 10, 1), 'Câmara')
  assert.equal(officerOn(2026, 10, 2), 'Thamiris')
  assert.equal(officerOn(2026, 10, 3), 'Câmara')
  assert.equal(officerOn(2026, 10, 4), 'Thamiris')
})

test('normaliza datas anteriores à data-base', () => {
  assert.equal(officerOn(2026, 9, 28), 'Thamiris')
  assert.equal(officerOn(2026, 9, 27), 'Câmara')
})

test('mantém a alternância em datas distantes', () => {
  assert.equal(officerOn(2027, 9, 29), 'Thamiris')
  assert.equal(officerOn(2028, 9, 29), 'Thamiris')
  assert.notEqual(officerOn(2028, 9, 29), officerOn(2028, 9, 30))
})
