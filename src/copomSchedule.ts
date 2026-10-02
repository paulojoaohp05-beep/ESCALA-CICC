export type CopomSchedule = { day: string; night: string }

const COPOM_DAY = ['BORGES', 'HONORATO', 'SENA', 'HONORATO', 'SENA'] as const
const COPOM_NIGHT = ['PANDORI', 'MACHADO', 'BORGES', 'PANDORI', 'MACHADO'] as const
const MS_PER_DAY = 86_400_000
const BASE_COPOM_UTC = Date.UTC(2026, 8, 1)

export function getCopomSchedule(date: Date): CopomSchedule {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysSinceBase = Math.floor((utcDate - BASE_COPOM_UTC) / MS_PER_DAY)
  const index = ((daysSinceBase % 5) + 5) % 5
  return { day: COPOM_DAY[index], night: COPOM_NIGHT[index] }
}
