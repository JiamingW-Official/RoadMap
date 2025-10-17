import * as React from 'react'
import type { FirmInput } from '../content/schema'
import { useMapOverrides } from '../store/mapOverrides'

const CACHE_KEY = 'geocodeCacheV1'

function loadCache(): Record<string, [number, number]> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function saveCache(cache: Record<string, [number, number]>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch {}
}

// NYC metro bounds
const NYC_BOUNDS = { minLat: 40.40, maxLat: 41.10, minLng: -74.40, maxLng: -73.50 }
function inNYC(lat:number, lng:number){
  return lat>=NYC_BOUNDS.minLat && lat<=NYC_BOUNDS.maxLat && lng>=NYC_BOUNDS.minLng && lng<=NYC_BOUNDS.maxLng
}

async function geocodeOne(address: string): Promise<[number, number] | null> {
  const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined
  // Prefer Mapbox for higher accuracy if token is available
  if (token) {
    const bbox = `${NYC_BOUNDS.minLng},${NYC_BOUNDS.minLat},${NYC_BOUNDS.maxLng},${NYC_BOUNDS.maxLat}`
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&bbox=${bbox}&proximity=-73.9855,40.758`
    const resp = await fetch(url)
    if (resp.ok) {
      const data: any = await resp.json()
      const f = data.features?.[0]
      if (f && Array.isArray(f.center) && f.center.length === 2) {
        const [lng, lat] = f.center
        if (inNYC(lat, lng)) return [lat, lng]
      }
    }
  }
  // Fallback to Nominatim
  const url2 = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1&addressdetails=0`
  const resp2 = await fetch(url2)
  if (resp2.ok) {
    const arr: any[] = await resp2.json()
    if (arr && arr[0]) {
      const lat = parseFloat(arr[0].lat)
      const lon = parseFloat(arr[0].lon)
      if (Number.isFinite(lat) && Number.isFinite(lon) && inNYC(lat, lon)) return [lat, lon]
    }
  }
  return null
}

export function useGeocodeMissingPositions(firms: FirmInput[]) {
  const { firmPositions, setFirmPosition } = useMapOverrides()

  const trigger = React.useCallback(async () => {
    if (typeof window === 'undefined' || !('fetch' in window)) return
    const cache = loadCache()
    const missing = firms.filter(f => !f.position && !firmPositions[f.id])
    for (const f of missing) {
      const key = `${f.firm_name}|${f.hq_address}|${f.city}|${f.state}`
      if (cache[key]) { setFirmPosition(f.id, cache[key]); continue }
      const addr = `${f.hq_address}, ${f.city}, ${f.state}`
      try {
        const pos = await geocodeOne(addr)
        if (pos) {
          cache[key] = pos
          saveCache(cache)
          setFirmPosition(f.id, pos)
        }
      } catch {}
      await new Promise(r => setTimeout(r, 700))
    }
  }, [firms, firmPositions, setFirmPosition])

  // auto-run once on mount
  React.useEffect(() => { trigger() }, [trigger])

  return trigger
}
