import 'leaflet/dist/leaflet.css'
import * as React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet'
import L, { type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet'
import { NYC_CENTER, hashKey, placeholderPosition } from '../lib/map'
import { useSelection } from '../store/selection'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { useMapOverrides } from '../store/mapOverrides'
import { useGeocodeMissingPositions } from '../hooks/useGeocode'

const CATEGORY_HEX: Record<string, string> = {
  Angel: '#F5C518', // gold
  VC: '#3B82F6',
  PE: '#7C3AED',
  'Investment Bank': '#38BDF8',
  'Asset Manager': '#10B981',
}

function createIcon(color: string, label?: string) {
  const html = `<div style="
    width: 20px; height: 20px; border-radius: 50%;
    background: ${color}; color: #111; display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 0 2px rgba(0,0,0,0.3); font-weight: 700; font-size: 12px;">
    ${label ?? ''}
  </div>`
  return L.divIcon({ html, className: '', iconSize: [20, 20] })
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

function clusterPoints(points: { id:number, pos:[number, number], firm:any, hasPos:boolean }[], zoom:number){
  const pxThreshold = zoom >= 14 ? 20 : zoom >= 12 ? 30 : 40
  const clusters: { center:[number,number], members: typeof points }[] = [] as any
  for (const p of points){
    let bucket = clusters.find(c => Math.hypot(c.center[0]-p.pos[0], c.center[1]-p.pos[1]) < 0.003)
    if (!bucket){ clusters.push({ center: p.pos, members: [p] as any }) }
    else { bucket.members.push(p) }
  }
  return clusters
}

export function MapView() {
  const { selectedFirmId } = useSelection()
  const { firms } = useContentCtx()
  const { firmPositions, setFirmPosition } = useMapOverrides()
  useGeocodeMissingPositions(firms)
  const mapRef = React.useRef<LeafletMap | null>(null)
  const markerMapRef = React.useRef<Map<number, LeafletMarker>>(new Map())

  const firmsWithPos = React.useMemo(() => {
    return firms.map((f) => {
      const override = firmPositions[f.id]
      const resolved = override ?? f.position ?? placeholderPosition(hashKey(f.firm_name))
      const hasPos = Boolean(f.position || override)
      return { id: f.id, firm: f, pos: resolved as [number,number], hasPos }
    })
  }, [firms, firmPositions])

  const clusters = React.useMemo(() => {
    const z = mapRef.current?.getZoom() ?? 12
    return clusterPoints(firmsWithPos, z)
  }, [firmsWithPos])

  React.useEffect(() => {
    if (!selectedFirmId) return
    const marker = markerMapRef.current.get(selectedFirmId)
    const firmEntry = firmsWithPos.find((x) => x.id === selectedFirmId)
    if (marker && firmEntry && mapRef.current) {
      mapRef.current.setView({ lat: firmEntry.pos[0], lng: firmEntry.pos[1] }, mapRef.current.getZoom(), { animate: true })
      marker.openPopup()
    }
  }, [selectedFirmId, firmsWithPos])

  return (
    <div className="h-full rounded-xl overflow-hidden border border-border/60">
      <MapContainer
        center={{ lat: NYC_CENTER[0], lng: NYC_CENTER[1] }}
        zoom={12}
        scrollWheelZoom
        className="h-full"
        whenCreated={(m)=>{ mapRef.current = m; }}
      >
        <MapReady onMap={(m) => (mapRef.current = m)} />
        <Basemap />
        {clusters.map((c, ci) => c.members.length > 3 ? (
          <CircleMarker key={`cluster-${ci}`} center={{ lat: c.center[0], lng: c.center[1] }} radius={14} pathOptions={{ color: '#F5C518', fillColor: '#111', fillOpacity: 0.6 }}>
            <Popup>
              <div style={{ fontWeight: 700 }}>Cluster: {c.members.length} firms</div>
            </Popup>
          </CircleMarker>
        ) : (
          c.members.map(({ firm, pos, hasPos }) => (
            <Marker
              key={firm.id}
              position={{ lat: pos[0], lng: pos[1] }}
              icon={hasPos ? createIcon(CATEGORY_HEX[firm.category] ?? '#94A3B8') : createIcon('#9CA3AF', '?')}
              ref={(m) => {
                if (m) markerMapRef.current.set(firm.id, m)
                else markerMapRef.current.delete(firm.id)
              }}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{firm.firm_name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{firm.category}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{firm.hq_address}, {firm.city}, {firm.state}</div>
                  {firm.website && (
                    <div style={{ marginTop: 8 }}>
                      <a href={firm.website} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: 12 }}>
                        Open Website
                      </a>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <button onClick={()=>{
                      const c = markerMapRef.current.get(firm.id)?.getLatLng()
                      if (c) setFirmPosition(firm.id, [c.lat, c.lng])
                    }} className="px-2 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80" data-cursor="interactive">Set Location</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        ))}
      </MapContainer>
    </div>
  )
}
