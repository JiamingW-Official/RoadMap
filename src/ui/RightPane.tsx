import { useGameStore } from '../store/game'
import { useContentCtx } from './providers/ContentProvider'
import { useToast } from '../components/ui/toast'
import { useMapOverrides } from '../store/mapOverrides'

export function RightPane() {
  const { economy } = useContentCtx()
  const player = useGameStore(s => s.player)
  const raiseRound = useGameStore(s => s.raiseRound)
  const worldHype = useGameStore(s => s.world.hype)
  const setWorldHype = useGameStore.setState
  const { notify } = useToast()
  const { clearOverrides } = useMapOverrides()
  const order: Array<typeof player.round> = ['Pre-Seed','Seed','Series A','Series B','Series C','IPO','Post-IPO']
  const idx = Math.min(order.indexOf(player.round) + 1, order.length - 1)
  const next = order[idx] ?? player.round
  const mult = economy.round_multipliers[next] ?? 1.3
  const dil = economy.dilution_ranges[next] ?? [0.15, 0.25]
  return (
    <div className="h-full p-3 overflow-auto grid gap-3">
      <div className="rounded-lg glass p-3">
        <div className="text-sm font-medium mb-2">Rounds</div>
        <div className="text-xs text-muted-foreground mb-2">Next: {next} · Multiplier ~ {mult} · Dilution mid {( (dil[0]+dil[1])/2 * 100).toFixed(0)}%</div>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90" onClick={()=>{ raiseRound(mult, dil); notify(`Raised ${next} round`) }} data-cursor="interactive">Raise Next Round</button>
      </div>
      <div className="rounded-lg glass p-3">
        <div className="text-sm font-medium mb-2">Economy</div>
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="text-muted-foreground">Hype:</span>
          {(['bear','neutral','bull'] as const).map(h => (
            <button key={h} onClick={()=>setWorldHype((s:any)=>({ world: { ...s.world, hype: h } }))} className={`px-2 py-0.5 rounded ${worldHype===h?'bg-accent text-[hsl(20,14%,4%)]':'bg-secondary/60'}`} data-cursor="interactive">{h}</button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Round multipliers: {Object.keys(economy.round_multipliers).length ? JSON.stringify(economy.round_multipliers) : 'default rules active'}</div>
      </div>
      <div className="rounded-lg glass p-3">
        <div className="text-sm font-medium mb-2">Data & Cache</div>
        <button className="px-2 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80" onClick={()=>{ try { localStorage.removeItem('geocodeCacheV1') } catch {} clearOverrides(); notify('Geocode cache cleared.'); }} data-cursor="interactive">Clear Geocode Cache</button>
      </div>
    </div>
  )
}
