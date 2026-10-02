import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchBrasilApiHolidays, getHolidaysForYear, mergeHolidays, normalizeBrasilApiHolidays } from './brasilApiHolidays.ts'
import { dateKey, getHolidays } from './holidays.ts'
import { getFifthBusinessDay } from './payment.ts'

const jsonResponse = (data: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))

test('normaliza retorno válido da BrasilAPI', () => {
  const holidays = normalizeBrasilApiHolidays([
    { date: '2026-09-07', name: 'Independência do Brasil', type: 'national' },
    { date: '2026-07-09', name: 'Revolução Constitucionalista', type: 'estadual' },
  ], 2026)
  assert.deepEqual(holidays.map(({ date, name, category }) => ({ date: dateKey(date), name, category })), [
    { date: '2026-09-07', name: 'Independência do Brasil', category: 'national' },
    { date: '2026-07-09', name: 'Revolução Constitucionalista', category: 'state' },
  ])
})

test('aceita resposta vazia e ignora itens inválidos', () => {
  assert.deepEqual(normalizeBrasilApiHolidays([], 2026), [])
  assert.deepEqual(normalizeBrasilApiHolidays([
    { date: 'data-inválida', name: 'Inválido', type: 'national' },
    { date: '2026-02-30', name: 'Data impossível', type: 'national' },
    { date: '2026-09-07', type: 'national' },
    { date: '2026-09-07', name: 'Tipo desconhecido', type: 'other' },
  ], 2026), [])
})

test('remove duplicidade entre API e dados locais', () => {
  const api = normalizeBrasilApiHolidays([{ date: '2026-01-25', name: 'Aniversário da Cidade de São Paulo', type: 'national' }], 2026)
  const merged = mergeHolidays(api, getHolidays(2026))
  const cityHoliday = merged.filter((holiday) => dateKey(holiday.date) === '2026-01-25' && holiday.name === 'Aniversário da Cidade de São Paulo')
  assert.equal(cityHoliday.length, 1)
  assert.equal(cityHoliday[0].category, 'municipal')
})

test('preserva classificação local e não transforma ponto facultativo em feriado', () => {
  const api = normalizeBrasilApiHolidays([
    { date: '2026-02-16', name: 'Carnaval', type: 'national' },
    { date: '2026-01-25', name: 'Aniversário da Cidade de São Paulo', type: 'state' },
  ], 2026)
  const merged = mergeHolidays(api, getHolidays(2026))
  assert.equal(merged.some((holiday) => dateKey(holiday.date) === '2026-02-16'), false)
  assert.equal(merged.find((holiday) => dateKey(holiday.date) === '2026-01-25')?.category, 'municipal')
  assert.equal(merged.find((holiday) => dateKey(holiday.date) === '2026-07-09')?.category, 'state')
})

test('usa fallback local quando a API está indisponível', async () => {
  const holidays = await getHolidaysForYear(2026, { fetcher: (() => Promise.reject(new Error('offline'))) as typeof fetch })
  assert.equal(holidays.find((holiday) => dateKey(holiday.date) === '2026-09-07')?.name, 'Independência do Brasil')
})

test('usa fallback local quando a resposta é vazia ou inválida', async () => {
  const empty = await getHolidaysForYear(2026, { fetcher: (() => jsonResponse([])) as typeof fetch })
  const invalid = await getHolidaysForYear(2026, { fetcher: (() => jsonResponse([{ invalid: true }])) as typeof fetch })
  assert.ok(empty.length > 0)
  assert.ok(invalid.length > 0)
})

test('interrompe a consulta no timeout e usa fallback', async () => {
  const fetcher = ((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Abortado', 'AbortError')))
  })) as typeof fetch
  const holidays = await getHolidaysForYear(2026, { fetcher, timeoutMs: 5 })
  assert.ok(holidays.some((holiday) => holiday.category === 'municipal'))
})

test('preserva feriados municipais ao combinar com a API', async () => {
  const fetcher = (() => jsonResponse([{ date: '2026-09-07', name: 'Independência do Brasil', type: 'national' }])) as typeof fetch
  const holidays = await getHolidaysForYear(2026, { fetcher })
  assert.equal(holidays.find((holiday) => dateKey(holiday.date) === '2026-01-25')?.category, 'municipal')
  assert.equal(holidays.find((holiday) => dateKey(holiday.date) === '2026-06-04')?.category, 'municipal')
})

test('quinto dia útil usa feriado vindo da API', async () => {
  const fetcher = (() => jsonResponse([{ date: '2024-01-03', name: 'Feriado da API', type: 'national' }])) as typeof fetch
  const holidays = await getHolidaysForYear(2024, { fetcher })
  assert.equal(getFifthBusinessDay(2024, 0, holidays).getDate(), 8)
})

test('quinto dia útil usa feriado municipal local', async () => {
  const fetcher = (() => jsonResponse([{ date: '2026-09-07', name: 'Independência do Brasil', type: 'national' }])) as typeof fetch
  const holidays = await getHolidaysForYear(2026, { fetcher })
  assert.equal(getFifthBusinessDay(2026, 5, holidays).getDate(), 8)
})

test('lança em erro HTTP na consulta direta', async () => {
  await assert.rejects(() => fetchBrasilApiHolidays(2026, { fetcher: (() => jsonResponse({ error: true }, 503)) as typeof fetch }), /503/)
})
