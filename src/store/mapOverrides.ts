import { create } from 'zustand'
import type { LatLngTuple } from '../types/firm'

interface MapOverridesState {
  firmPositions: Record<number, LatLngTuple>
  setFirmPosition: (id: number, pos: LatLngTuple) => void
  clearOverrides: () => void
}

export const useMapOverrides = create<MapOverridesState>((set) => ({
  firmPositions: {},
  setFirmPosition: (id, pos) => set((s) => ({ firmPositions: { ...s.firmPositions, [id]: pos } })),
  clearOverrides: () => set({ firmPositions: {} }),
}))
