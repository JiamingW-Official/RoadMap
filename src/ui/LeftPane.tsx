import * as React from 'react'
import { FirmsList } from '../components/FirmsList'

export function LeftPane() {
  const [tab, setTab] = React.useState<'firms'|'events'|'rivals'>('firms')
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border/60 flex gap-2 text-sm">
        <button className={`px-3 py-1.5 rounded-md ${tab==='firms'?'bg-secondary':'bg-secondary/60'}`} onClick={()=>setTab('firms')}>Firms</button>
        <button className={`px-3 py-1.5 rounded-md ${tab==='events'?'bg-secondary':'bg-secondary/60'}`} onClick={()=>setTab('events')}>Events</button>
        <button className={`px-3 py-1.5 rounded-md ${tab==='rivals'?'bg-secondary':'bg-secondary/60'}`} onClick={()=>setTab('rivals')}>Rivals</button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2 pb-4">
        {tab === 'firms' && <FirmsList />}
        {tab === 'events' && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="text-sm font-medium">Placeholder Card</div>
            <div className="text-xs text-muted-foreground">Events will be listed here.</div>
          </div>
        )}
        {tab === 'rivals' && (
          <div className="rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="text-sm font-medium">Placeholder Card</div>
            <div className="text-xs text-muted-foreground">Rivals will be listed here.</div>
          </div>
        )}
      </div>
    </div>
  )
}
