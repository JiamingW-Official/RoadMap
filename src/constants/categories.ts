import type { FirmCategory } from '../types/firm'

export const CATEGORY_ORDER: FirmCategory[] = [
  'Angel',
  'VC',
  'PE',
  'Investment Bank',
  'Asset Manager',
]

export const CATEGORY_HEX: Record<FirmCategory, string> = {
  Angel: '#F5C518',
  VC: '#3B82F6',
  PE: '#7C3AED',
  'Investment Bank': '#38BDF8',
  'Asset Manager': '#10B981',
}
