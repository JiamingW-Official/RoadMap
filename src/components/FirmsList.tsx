import * as React from 'react'
import { FirmCard } from './FirmCard'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { useSelection } from '../store/selection'
import { useCategoryFilter } from '../store/categoryFilter'
import { CATEGORY_ORDER, CATEGORY_HEX } from '../constants/categories'
import type { FirmInput } from '../content/schema'
import type { FirmCategory } from '../types/firm'

export function FirmsList() {
  const [q, setQ] = React.useState('')
  const { firms } = useContentCtx()
  const { selectedFirmId, setSelectedFirmId } = useSelection()
  const activeRecord = useCategoryFilter((s) => s.active)
  const activeCategories = React.useMemo(() => new Set(CATEGORY_ORDER.filter((cat) => activeRecord[cat])), [activeRecord])
  const filtered = React.useMemo(() => {
    const t = q.toLowerCase()
    return firms.filter(f =>
      activeCategories.has(f.category as FirmCategory) &&
      (f.firm_name.toLowerCase().includes(t) || f.category.toLowerCase().includes(t) || f.city.toLowerCase().includes(t))
    )
  }, [q, firms, activeCategories])

  const grouped = React.useMemo(() => {
    const map = new Map<FirmCategory, FirmInput[]>(CATEGORY_ORDER.map((cat) => [cat, [] as FirmInput[]]))
    for (const firm of filtered) {
      const cat = firm.category as FirmCategory
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(firm)
    }
    return CATEGORY_ORDER.map((cat) => ({ cat, items: (map.get(cat) ?? []).sort((a, b) => a.firm_name.localeCompare(b.firm_name)) }))
  }, [filtered])

  return (
    <div className="grid gap-2">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search firms..."
        className="w-full rounded-lg bg-background/60 border border-border/60 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent/60"
      />
      <div className="thin-scroll max-h-[62vh] overflow-auto grid gap-3 pr-1">
        {grouped.map(({ cat, items }) => (
          items.length > 0 && (
            <div key={cat} className="grid gap-1">
              <div className="flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.15em] text-foreground/50">
                <span
                  className="h-1.5 w-6 rounded-full"
                  style={{ background: CATEGORY_HEX[cat] }}
                />
                {cat}
              </div>
              <div className="grid gap-1.5">{
                items.map((firm) => (
                  <FirmCard
                    key={firm.id}
                    firm={firm}
                    selected={selectedFirmId === firm.id}
                    onSelect={() => setSelectedFirmId(firm.id)}
                  />
                ))
              }</div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
