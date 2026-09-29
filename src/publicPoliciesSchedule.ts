export type PublicPoliciesOfficer = 'Câmara' | 'Thamiris'

const OFFICERS: PublicPoliciesOfficer[] = ['Câmara', 'Thamiris']
const MS_PER_DAY = 86_400_000
const BASE_PUBLIC_POLICIES_UTC = Date.UTC(2026, 8, 29)

export function getPublicPoliciesOfficer(date: Date): PublicPoliciesOfficer {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysSinceBase = Math.floor((utcDate - BASE_PUBLIC_POLICIES_UTC) / MS_PER_DAY)
  const index = ((daysSinceBase % 2) + 2) % 2
  return OFFICERS[index]
}
