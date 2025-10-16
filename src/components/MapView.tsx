import 'leaflet/dist/leaflet.css'
import * as React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet'
import { NYC_CENTER, hashKey, placeholderPosition } from '../lib/map'
import { MOCK_FIRMS } from '../mock/firms'
import { useSelection } from '../store/selection'

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

export function MapView() {
  const { selectedFirmId } = useSelection()
  const mapRef = React.useRef<LeafletMap | null>(null)
  const markerMapRef = React.useRef<Map<number, LeafletMarker>>(new Map())

  const firmsWithPos = React.useMemo(() => {
    return MOCK_FIRMS.map((f) => {
      const hasPos = Boolean(f.position)
      const pos = f.position ?? placeholderPosition(hashKey(f.firm_name))
      return { firm: f, pos, hasPos }
    })
  }, [])

  React.useEffect(() => {
    if (!selectedFirmId) return
    const marker = markerMapRef.current.get(selectedFirmId)
    const firmEntry = firmsWithPos.find((x) => x.firm.id === selectedFirmId)
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
      >
        <MapReady onMap={(m) => (mapRef.current = m)} />
        <Basemap />
        {firmsWithPos.map(({ firm, pos, hasPos }) => (
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
