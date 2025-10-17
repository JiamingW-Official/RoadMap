import * as React from 'react'
import { FirmCard } from './FirmCard'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { Button } from './ui/button'

export function FirmsList() {
  const [q, setQ] = React.useState('')
  const { firms } = useContentCtx()
  const filtered = React.useMemo(() => {
    const t = q.toLowerCase()
    return firms.filter(f => f.firm_name.toLowerCase().includes(t) || f.category.toLowerCase().includes(t) || f.city.toLowerCase().includes(t))
  }, [q, firms])

  return (
    <div className="grid gap-3">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search firms..."
        className="w-full rounded-md bg-secondary/50 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-[60vh] overflow-auto grid gap-3 pr-1">
        {filtered.map(firm => (
          <div key={firm.id} className="grid gap-2">
            <FirmCard firm={firm as any} />
            <div>
              <Button size="sm" variant="outline" data-cursor="interactive">
                Focus on Map
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
