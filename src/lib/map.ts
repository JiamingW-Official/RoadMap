import type { LatLngTuple } from '../types/firm'

export const NYC_CENTER: LatLngTuple = [40.758, -73.9855]

export function placeholderPosition(seed = 0): LatLngTuple {
  return [NYC_CENTER[0] + Math.sin(seed + 1) * 0.01, NYC_CENTER[1] + Math.cos(seed + 2) * 0.01]
}

export function hashKey(s: string): number {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}
