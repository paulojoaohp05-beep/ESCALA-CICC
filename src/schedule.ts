export type Group = 'A' | 'B'

export type Team = {
  coordination: { day: string; night: string }
  cabin: { day: string; night: string }
}

export const TEAMS: Record<Group, Team> = {
  A: {
    coordination: { day: 'SGT Deyse', night: 'SGT Campos' },
    cabin: { day: 'Jéssica', night: 'Nedilson' },
  },
  B: {
    coordination: { day: 'SGT Bessane', night: 'SGT De Souza' },
    cabin: { day: 'SD Larissa', night: 'R. Santos' },
  },
}

export const OFFICERS = Object.values(TEAMS).flatMap((team) => [
  team.coordination.day,
  team.coordination.night,
  team.cabin.day,
  team.cabin.night,
])

const MS_PER_DAY = 86_400_000
const BASE_MONDAY_UTC = Date.UTC(2026, 8, 28)

export function getGroupForDate(date: Date): Group {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysSinceBase = Math.floor((utcDate - BASE_MONDAY_UTC) / MS_PER_DAY)
  const weekOffset = Math.floor(daysSinceBase / 7)
  const isBasePattern = ((weekOffset % 2) + 2) % 2 === 0
  const weekdayFromMonday = (date.getDay() + 6) % 7
  const isFatDay = weekdayFromMonday !== 1 && weekdayFromMonday !== 3

  return isFatDay === isBasePattern ? 'A' : 'B'
}

export function groupHasOfficer(group: Group, officer: string) {
  const team = TEAMS[group]
  return [team.coordination.day, team.coordination.night, team.cabin.day, team.cabin.night].includes(officer)
}

export function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
}
