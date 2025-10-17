import * as React from 'react'
import { FirmCard } from './FirmCard'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { useSelection } from '../store/selection'
import { useCategoryFilter } from '../store/categoryFilter'
import { CATEGORY_ORDER } from '../constants/categories'
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

  return (
    <div className="grid gap-4">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search firms..."
        className="w-full rounded-lg bg-background/60 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/60"
      />
      <div className="max-h-[62vh] overflow-auto grid gap-4 pr-1">
        {filtered.map((firm: FirmInput) => (
          <FirmCard
            key={firm.id}
            firm={firm}
            selected={selectedFirmId === firm.id}
            onSelect={() => setSelectedFirmId(firm.id)}
          />
        ))}
      </div>
    </div>
  )
}
