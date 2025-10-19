import 'leaflet/dist/leaflet.css'
import * as React from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L, { type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet'
import { NYC_CENTER } from '../lib/map'
import { useSelection } from '../store/selection'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { useMapOverrides } from '../store/mapOverrides'
import { useGeocodeMissingPositions } from '../hooks/useGeocode'
import type { FirmInput } from '../content/schema'
import type { FirmCategory } from '../types/firm'
import { CATEGORY_HEX, CATEGORY_ORDER } from '../constants/categories'
import { useCategoryFilter } from '../store/categoryFilter'

type CategoryKey = FirmCategory

type CreateIconOptions = {
  primary: string
  secondary?: string
  placeholder?: boolean
  highlight?: boolean
}

function createIcon({ primary, secondary, placeholder, highlight }: CreateIconOptions) {
  const coreColor = placeholder ? '#9CA3AF' : primary
  const outerBorder = primary
  const innerBorder = secondary ?? ''
  const hasSecondary = Boolean(secondary)
  const glow = highlight ? `box-shadow: 0 0 0 3px rgba(255,255,255,0.25);` : ''
  const html = `<div style="
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      ${glow}
    ">
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid ${outerBorder};
        background: ${outerBorder}22;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${hasSecondary ? `<div style="
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          border: 2px solid ${innerBorder};
          background: transparent;
        "></div>` : ''}
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${coreColor};
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          font-size: 9px;
          font-weight: 700;
        ">
        </div>
      </div>
    </div>`
  return L.divIcon({
    html,
    className: 'firm-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
  })
}

type SearchResult = {
  id: string
  name: string
  subtitle: string
  lat: number
  lng: number
}

type AggregatedFirm = {
  key: string
  ids: number[]
  entries: {
    firm: FirmInput
    hasOriginalPos: boolean
    hasOverridePos: boolean
  }[]
  categories: CategoryKey[]
  pos: [number, number]
  displayName: string
  address: string
  website?: string
}

function MapReady({ onMap }: { onMap: (m: LeafletMap) => void }) {
  const map = useMap()
  React.useEffect(() => {
    onMap(map)
    const ctrl = (map as any)._controlCorners?.bottomright?.querySelector?.('.leaflet-control-attribution')
    if (ctrl) (ctrl as HTMLElement).style.display = 'none'
  }, [map, onMap])
  return null
}

function Basemap() {
  const mapboxToken = (import.meta.env['VITE_MAPBOX_TOKEN'] as string | undefined)
  const style = (import.meta.env['VITE_MAPBOX_STYLE'] as string | undefined) || 'mapbox/navigation-night-v1'
  if (mapboxToken) {
    const url = `https://api.mapbox.com/styles/v1/${style}/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    return (
      <TileLayer
        url={url}
        tileSize={512}
        zoomOffset={-1}
      />
    )
  }
  return (
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    />
  )
}

export function MapView() {
  const { selectedFirmId, setSelectedFirmId } = useSelection()
  const { firms } = useContentCtx()
  const { firmPositions } = useMapOverrides()
  useGeocodeMissingPositions(firms)
  const mapRef = React.useRef<LeafletMap | null>(null)
  const markerMapRef = React.useRef<Map<string, LeafletMarker>>(new Map())
  const searchAbortRef = React.useRef<AbortController | null>(null)

  const aggregateData = React.useMemo(() => {
    const brandKey = (name: string) => {
      return name
        .replace(/\b(Asset Management|Capital Markets|Securities|Holdings|Group|LLC|Inc\.?|Ltd\.?|Partners|Management|Advisors|Investments?|Investment|Ventures?|Venture|Global)\b/gi, '')
        .replace(/[()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
    }
    const map = new Map<string, AggregatedFirm>()
    const idToKey = new Map<number, string>()
    const sortedCategories = (set: Set<CategoryKey>) => CATEGORY_ORDER.filter((c) => set.has(c))
    for (const f of firms) {
      const override = firmPositions[f.id]
      const resolved = override ?? f.position
      if (!resolved) continue
      const hasOriginal = Boolean(f.position)
      const hasOverride = Boolean(override)
      const baseName = brandKey(f.firm_name)
      const address = (f.hq_address ?? '').toLowerCase()
      const baseKey = `${baseName}|${address}`
      const fallbackKey = `${resolved[0].toFixed(5)}|${resolved[1].toFixed(5)}`
      const key = baseName ? baseKey : fallbackKey
      const existing = map.get(key)
      if (!existing) {
        const categories = new Set<CategoryKey>()
        if (CATEGORY_HEX[f.category as CategoryKey]) categories.add(f.category as CategoryKey)
        map.set(key, {
          key,
          ids: [f.id],
          entries: [{ firm: f, hasOriginalPos: hasOriginal, hasOverridePos: hasOverride }],
          categories: sortedCategories(categories),
          pos: resolved as [number, number],
          displayName: f.firm_name,
          address: f.hq_address ?? '',
          website: f.website ?? undefined,
        })
        idToKey.set(f.id, key)
      } else {
        existing.ids.push(f.id)
        existing.entries.push({ firm: f, hasOriginalPos: hasOriginal, hasOverridePos: hasOverride })
        const categories = new Set(existing.categories)
        if (CATEGORY_HEX[f.category as CategoryKey]) categories.add(f.category as CategoryKey)
        existing.categories = sortedCategories(categories)
        if (!existing.website && f.website) existing.website = f.website
        if (existing.displayName.length > f.firm_name.length) existing.displayName = f.firm_name
        idToKey.set(f.id, key)
        map.set(key, existing)
      }
    }
    return {
      list: Array.from(map.values()),
      idToKey,
      map,
    }
  }, [firms, firmPositions])

  const firmsWithPos = aggregateData.list
  const idToAggregateKey = aggregateData.idToKey

  const categoryKeys = CATEGORY_ORDER
  const activeRecord = useCategoryFilter((s) => s.active)
  const toggleCategory = useCategoryFilter((s) => s.toggle)
  const resetCategories = useCategoryFilter((s) => s.reset)
  const activeCategories = React.useMemo(() => new Set(categoryKeys.filter((cat) => activeRecord[cat])), [categoryKeys, activeRecord])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [searchMarker, setSearchMarker] = React.useState<SearchResult | null>(null)

  React.useEffect(() => {
    if (!selectedFirmId) return
    const aggregateKey = idToAggregateKey.get(selectedFirmId)
    if (!aggregateKey) return
    const marker = markerMapRef.current.get(aggregateKey)
    const firmEntry = aggregateData.map.get(aggregateKey)
    if (marker && firmEntry && mapRef.current) {
      mapRef.current.setView({ lat: firmEntry.pos[0], lng: firmEntry.pos[1] }, Math.max(mapRef.current.getZoom(), 14), { animate: true })
    }
  }, [selectedFirmId, aggregateData.map, idToAggregateKey])

  const fetchSearchResults = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }
    if (searchAbortRef.current) searchAbortRef.current.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller
    setSearchLoading(true)
    setSearchError(null)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '5',
        lang: 'en',
      })
      const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      })
      if (!res.ok) throw new Error(`Search failed (${res.status})`)
      const data = await res.json()
      const mapped: SearchResult[] = (data?.features ?? []).map((feature: any, idx: number) => ({
        id: `${feature.properties?.osm_id ?? idx}`,
        name: feature.properties?.name ?? feature.properties?.street ?? 'Result',
        subtitle: [feature.properties?.street, feature.properties?.city].filter(Boolean).join(', '),
        lat: Number(feature.geometry?.coordinates?.[1]),
        lng: Number(feature.geometry?.coordinates?.[0]),
      })).filter((item: SearchResult) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      setSearchResults(mapped)
      if (!mapped.length) setSearchError('No matches found')
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error(err)
      setSearchError('Search failed, please try again')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void fetchSearchResults(searchQuery)
  }, [fetchSearchResults, searchQuery])

  const handleResultSelect = React.useCallback((result: SearchResult) => {
    setSearchResults([])
    setSearchMarker(result)
    if (mapRef.current) {
      mapRef.current.flyTo({ lat: result.lat, lng: result.lng }, Math.max(mapRef.current.getZoom(), 15), { animate: true })
    }
  }, [])

  const filteredFirmsWithPos = React.useMemo(() => {
    return firmsWithPos.filter((agg) => agg.categories.some((c) => activeCategories.has(c)))
  }, [firmsWithPos, activeCategories])

  const categoriesAllActive = React.useMemo(() => categoryKeys.every((cat) => activeRecord[cat]), [categoryKeys, activeRecord])

  const selectedAggregate = React.useMemo(() => {
    if (!selectedFirmId) return null
    const key = idToAggregateKey.get(selectedFirmId)
    if (!key) return null
    return aggregateData.map.get(key) ?? null
  }, [selectedFirmId, aggregateData.map, idToAggregateKey])

  return (
    <div className="h-full rounded-xl overflow-hidden border border-border/60 relative">
      <div className="absolute top-4 left-4 z-[4000] w-72 max-w-[85vw]">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/90 backdrop-blur px-3 py-3 shadow-lg"
        >
          <label className="text-xs uppercase tracking-[0.08em] font-semibold text-foreground/60">
            Search Map
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!e.target.value) {
                  setSearchResults([])
                  setSearchError(null)
                }
              }}
              placeholder="Search an NYC address or landmark"
              className="flex-1 rounded-lg bg-background/80 border border-border/70 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
              data-cursor="text"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary/80 px-3 py-2 text-xs font-semibold text-background hover:bg-primary transition-colors disabled:opacity-70"
              data-cursor="interactive"
              disabled={searchLoading}
            >
              {searchLoading ? '...' : 'Go'}
            </button>
          </div>
          {searchError && (
            <div className="text-xs text-warning">
              {searchError}
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-border/60 bg-background/95 shadow-inner">
              <ul>
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleResultSelect(result)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary/15 transition-colors"
                      data-cursor="interactive"
                    >
                      <div className="font-semibold text-foreground">{result.name}</div>
                      <div className="text-xs text-foreground/60">{result.subtitle}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border/60 bg-background/85 backdrop-blur px-3 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.08em] font-semibold text-foreground/60">Filter Categories</span>
            <button
              type="button"
              onClick={resetCategories}
              className="text-[11px] uppercase tracking-[0.05em] text-primary/80 hover:text-primary transition-colors disabled:opacity-60"
              disabled={categoriesAllActive}
              data-cursor="interactive"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryKeys.map((cat) => {
              const active = activeCategories.has(cat)
              const color = CATEGORY_HEX[cat]
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="rounded-md border px-2 py-1 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/60"
                  style={{
                    borderColor: active ? color : 'rgba(148, 163, 184, 0.6)',
                    background: active ? `${color}22` : 'transparent',
                    color: active ? '#F8FAFC' : 'rgba(248, 250, 252, 0.7)',
                  }}
                  data-cursor="interactive"
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <MapContainer
        center={{ lat: NYC_CENTER[0], lng: NYC_CENTER[1] }}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="h-full"
      >
        <MapReady onMap={(m) => (mapRef.current = m)} />
        <Basemap />
        {searchMarker && (
          <Marker
            key="search-marker"
            position={{ lat: searchMarker.lat, lng: searchMarker.lng }}
            icon={createIcon({ primary: '#FDE047', highlight: true })}
          />
        )}
        {filteredFirmsWithPos.map((aggregate) => {
          const { pos, entries, categories, key } = aggregate
          const primaryCategory = (categories[0] as CategoryKey) ?? 'Angel'
          const secondaryCategory = categories[1] as CategoryKey | undefined
          const primaryColor = CATEGORY_HEX[primaryCategory] ?? '#94A3B8'
          const secondaryColor = secondaryCategory ? CATEGORY_HEX[secondaryCategory] : undefined
          const hasPlaceholder = entries.every(({ hasOriginalPos, hasOverridePos }) => !hasOriginalPos && !hasOverridePos)
          const isSelected = selectedAggregate?.key === key
          return (
            <Marker
              key={key}
              position={{ lat: pos[0], lng: pos[1] }}
              icon={createIcon({ primary: primaryColor, secondary: secondaryColor, placeholder: hasPlaceholder, highlight: isSelected })}
              ref={(m) => {
                if (m) markerMapRef.current.set(key, m)
                else markerMapRef.current.delete(key)
              }}
              eventHandlers={{
                click: () => {
                  setSelectedFirmId(entries[0]?.firm.id ?? null)
                },
              }}
            />
          )
        })}
      </MapContainer>
      {selectedAggregate && (
        <div className="pointer-events-none absolute top-6 right-6 z-[4000] w-[340px] max-w-[85vw]">
          <div className="pointer-events-auto overflow-hidden rounded-[26px] border border-white/12 bg-gradient-to-br from-white/12 via-background/45 to-background/20 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(15,23,42,0.55)]">
            <div className="relative p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-wide text-foreground/95">{selectedAggregate.displayName}</h3>
                  <p className="text-sm text-foreground/70">{selectedAggregate.address}</p>
                </div>
                <button
                  onClick={() => setSelectedFirmId(null)}
                  aria-label="Close"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-xs uppercase tracking-[0.15em] px-3 py-1 text-foreground/75"
                  data-cursor="interactive"
                >
                  Close
                </button>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {selectedAggregate.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{ background: `${CATEGORY_HEX[cat]}33`, color: CATEGORY_HEX[cat] }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
              {selectedAggregate.website && (
                <a
                  href={selectedAggregate.website}
                  target="_blank"
                  rel="noreferrer"
                  className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:bg-primary"
                  data-cursor="interactive"
                >
                  Open Website
                </a>
              )}
              <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-foreground/60 mb-2">Services</p>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  {selectedAggregate.entries.map(({ firm }) => (
                    <li key={firm.id} className="flex items-center justify-between gap-3">
                      <span>{firm.firm_name}</span>
                      <span className="text-foreground/55 text-xs uppercase tracking-[0.1em]">{firm.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
