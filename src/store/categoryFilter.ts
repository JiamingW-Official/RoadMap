import { create } from 'zustand'
import type { FirmCategory } from '../types/firm'
import { CATEGORY_ORDER } from '../constants/categories'

type ActiveRecord = Record<FirmCategory, boolean>

const defaultActive = CATEGORY_ORDER.reduce<ActiveRecord>((acc, cat) => {
  acc[cat] = true
  return acc
}, {} as ActiveRecord)

interface CategoryFilterState {
  active: ActiveRecord
  toggle: (cat: FirmCategory) => void
  reset: () => void
}

export const useCategoryFilter = create<CategoryFilterState>((set, get) => ({
  active: { ...defaultActive },
  toggle: (cat) =>
    set((state) => {
      const currentlyOn = state.active[cat]
      const activeCount = Object.values(state.active).filter(Boolean).length
      if (currentlyOn && activeCount === 1) return state
      return {
        active: {
          ...state.active,
          [cat]: !currentlyOn,
        },
      }
    }),
  reset: () => set({ active: { ...defaultActive } }),
}))

export const useActiveCategories = () => {
  const active = useCategoryFilter((s) => s.active)
  return new Set(CATEGORY_ORDER.filter((cat) => active[cat]))
}
