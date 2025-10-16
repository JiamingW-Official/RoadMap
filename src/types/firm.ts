export type LatLngTuple = [number, number]

export type FirmCategory =
  | 'Angel'
  | 'VC'
  | 'PE'
  | 'Investment Bank'
  | 'Asset Manager'

export interface Firm {
  id: number
  category: FirmCategory
  firm_name: string
  hq_address: string
  city: string
  state: string
  difficulty_level: 1 | 2 | 3 | 4 | 5
  cost_level: 1 | 2 | 3 | 4 | 5
  required_capital_usd?: string
  round_stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'IPO' | 'Post-IPO'
  website?: string
  sector_focus?: string
  valuation_increase_rate?: number
  equity_dilution_rate?: number
  reputation_effect?: number
  growth_speed_effect?: number
  position?: LatLngTuple
  __source?: 'base' | 'json' | 'csv' | 'merged'
}
