import * as React from 'react'
import Papa from 'papaparse'
import { FirmZ, type FirmInput, LatLngTupleZ, EconomyZ, type Economy } from '../content/schema'
import { NYC_CENTER, hashKey, placeholderPosition } from '../lib/map'

export type DatasetSource = 'base' | 'json' | 'csv' | 'all'

function inferRoundByCategory(category: string): FirmInput['round_stage'] {
  switch (category) {
    case 'Angel': return 'Pre-Seed'
    case 'VC': return 'Series A'
    case 'PE': return 'Series C'
    case 'Investment Bank': return 'IPO'
    case 'Asset Manager': return 'Post-IPO'
    default: return undefined
  }
}

function toNegativeId(rowIndex: number) { return -(10000 + rowIndex) }

const NYC_BOUNDS = { minLat: 40.40, maxLat: 41.10, minLng: -74.40, maxLng: -73.50 }
function inNYC(lat:number, lng:number){
  return lat>=NYC_BOUNDS.minLat && lat<=NYC_BOUNDS.maxLat && lng>=NYC_BOUNDS.minLng && lng<=NYC_BOUNDS.maxLng
}

function parseNum(v: any): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.trim())
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function parsePosition(inputPos: any): [number, number] | undefined {
  if (!inputPos) return undefined
  // object with lat/lng
  if (typeof inputPos === 'object' && !Array.isArray(inputPos)) {
    const lat = parseNum(inputPos.lat ?? inputPos.latitude ?? inputPos.Lat ?? inputPos.Latitude)
    const lng = parseNum(inputPos.lng ?? inputPos.lon ?? inputPos.longitude ?? inputPos.Longitude ?? inputPos.Lon)
    if (lat !== undefined && lng !== undefined) return [lat, lng]
  }
  // array [a,b] might be [lat,lng] or [lng,lat]
  if (Array.isArray(inputPos) && inputPos.length === 2) {
    const a = parseNum(inputPos[0])
    const b = parseNum(inputPos[1])
    if (a !== undefined && b !== undefined) {
      if (inNYC(a, b)) return [a, b]
      if (inNYC(b, a)) return [b, a]
      return [a, b] // fallback
    }
  }
  return undefined
}

function normalizeFirm(input: any, fallbackId: number, source: FirmInput['__source']): FirmInput | null {
  try {
    const lat = parseNum(input.lat ?? input.latitude ?? input.Lat ?? input.Latitude)
    const lng = parseNum(input.lng ?? input.lon ?? input.longitude ?? input.Longitude ?? input.Lon)
    let maybePos = (lat !== undefined && lng !== undefined) ? [lat, lng] as [number, number] : undefined
    if (!maybePos) maybePos = parsePosition(input.position)
    const base: FirmInput = {
      id: typeof input.id === 'number' ? input.id : fallbackId,
      category: input.category,
      firm_name: input.firm_name ?? input.Firm ?? input.name,
      hq_address: input.hq_address ?? input.Address ?? '',
      city: input.city ?? input.City ?? '',
      state: input.state ?? input.State ?? '',
      difficulty_level: Number(input.difficulty_level ?? input['Difficulty (1-5)']) as any,
      cost_level: Number(input.cost_level ?? input['Cost Level (1-5)']) as any,
      required_capital_usd: input.required_capital_usd,
      round_stage: input.round_stage ?? inferRoundByCategory(input.category),
      website: input.website ?? input.Website,
      sector_focus: input.sector_focus,
      valuation_increase_rate: typeof input.valuation_increase_rate === 'number' ? input.valuation_increase_rate : parseNum(input.valuation_increase_rate),
      equity_dilution_rate: typeof input.equity_dilution_rate === 'number' ? input.equity_dilution_rate : parseNum(input.equity_dilution_rate),
      reputation_effect: typeof input.reputation_effect === 'number' ? input.reputation_effect : parseNum(input.reputation_effect),
      growth_speed_effect: typeof input.growth_speed_effect === 'number' ? input.growth_speed_effect : parseNum(input.growth_speed_effect),
      position: maybePos,
      __source: source,
    }
    const parsed = FirmZ.safeParse(base)
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

function withPlaceholderPosition(firm: FirmInput, seedStr: string): FirmInput {
  if (!firm.position) {
    const pos = placeholderPosition(hashKey(seedStr))
    return { ...firm, position: pos }
  }
  return firm
}

function dedupeMerge(a: FirmInput[], b: FirmInput[]): FirmInput[] {
  const map = new Map<string, FirmInput>()
  const keyOf = (f: FirmInput) => `${f.firm_name}|${f.category}`.toLowerCase()
  for (const f of a) map.set(keyOf(f), f)
  for (const f of b) {
    const k = keyOf(f)
    if (!map.has(k)) map.set(k, f)
    else {
      const prev = map.get(k)!
      const merged: FirmInput = {
        ...prev,
        ...Object.fromEntries(Object.entries(f).filter(([k,v]) => (v !== undefined && v !== null && v !== ''))),
        position: prev.position ?? f.position,
        __source: prev.__source === 'json' ? prev.__source : f.__source,
      }
      map.set(k, merged)
    }
  }
  return Array.from(map.values())
}

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url)
    if (!res.ok) return fallback
    const data = await res.json()
    return data as T
  } catch {
    return fallback
  }
}

export function useContent() {
  const [source, setSource] = React.useState<DatasetSource>('all')
  const [firms, setFirms] = React.useState<FirmInput[]>([])
  const [economy, setEconomy] = React.useState<Economy>({ round_multipliers: {}, dilution_ranges: {} })
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async (src: DatasetSource) => {
    setError(null)
    const [baseFirms, baseEconomy] = await Promise.all([
      fetchJson<any[]>(`/startup_ipo_game_pack/data/firms.json`, []),
      fetchJson<any>(`/startup_ipo_game_pack/data/economy.json`, {}),
    ])

    const baseValid = baseFirms.map((r, i) => normalizeFirm(r, toNegativeId(80000 + i), 'base')).filter(Boolean) as FirmInput[]
    const econValid = EconomyZ.safeParse(baseEconomy)
    if (econValid.success) setEconomy(econValid.data)

    // JSON dataset (prefer root override, fallback to /datasets)
    let jsonFirms: FirmInput[] = []
    try {
      const jfRoot = await fetchJson<any[]>(`/nyc_firms.json`, null as any)
      const jf = jfRoot ?? await fetchJson<any[]>(`/datasets/nyc_firms.json`, [])
      jsonFirms = jf.map((r, i) => normalizeFirm(r, toNegativeId(1000 + i), 'json')).filter(Boolean) as FirmInput[]
    } catch { /* noop */ }

    // CSV dataset (prefer root override, fallback to /datasets)
    let csvFirms: FirmInput[] = []
    try {
      let text = await fetch(`/nyc_firms.csv`).then(r => r.ok ? r.text() : '')
      if (!text) text = await fetch(`/datasets/nyc_firms.csv`).then(r => r.ok ? r.text() : '')
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      csvFirms = (parsed.data as any[]).map((r, i) => normalizeFirm({
        id: toNegativeId(2000 + i),
        category: r.category ?? r.Category,
        firm_name: r.firm_name ?? r.Firm,
        hq_address: r.hq_address ?? r.Address,
        city: r.city ?? r.City,
        state: r.state ?? r.State,
        difficulty_level: r.difficulty_level ?? r['Difficulty (1-5)'],
        cost_level: r.cost_level ?? r['Cost Level (1-5)'],
        website: r.website ?? r.Website,
        round_stage: r.round_stage,
        lat: r.lat ?? r.latitude ?? r.Latitude ?? r.Lat,
        lng: r.lng ?? r.longitude ?? r.Longitude ?? r.Lon,
        position: r.position
      }, toNegativeId(2000 + i), 'csv')).filter(Boolean) as FirmInput[]
      csvFirms = csvFirms.map(f => ({ ...f, round_stage: f.round_stage ?? inferRoundByCategory(f.category) }))
    } catch { /* noop */ }

    let final: FirmInput[] = []
    if (src === 'base') final = baseValid
    else if (src === 'json') final = jsonFirms
    else if (src === 'csv') final = csvFirms
    else final = dedupeMerge(dedupeMerge(baseValid, csvFirms), jsonFirms)

    final = final.map(f => withPlaceholderPosition(f, f.firm_name))
    setFirms(final)
  }, [])

  React.useEffect(() => { load(source) }, [source, load])

  return { source, setSource, firms, economy, error }
}
