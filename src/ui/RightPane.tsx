import { useMemo } from 'react'
import { useGameStore } from '../store/game'
import { useContentCtx } from './providers/ContentProvider'
import { useToast } from '../components/ui/toast'
import { useMapOverrides } from '../store/mapOverrides'
import { CATEGORY_ORDER, CATEGORY_HEX } from '../constants/categories'
import type { FirmCategory } from '../types/firm'

const STAGE_ORDER = ['Pre-Seed','Seed','Series A','Series B','Series C','IPO','Post-IPO'] as const
const STAGE_SHORT: Record<string, string> = {
  'Pre-Seed': 'PRE',
  Seed: 'SEED',
  'Series A': 'A',
  'Series B': 'B',
  'Series C': 'C',
  IPO: 'IPO',
  'Post-IPO': 'POST',
}

export function RightPane() {
  const { economy, firms } = useContentCtx()
  const player = useGameStore(s => s.player)
  const raiseRound = useGameStore(s => s.raiseRound)
  const worldHype = useGameStore(s => s.world.hype)
  const setWorldHype = useGameStore(s => s.setWorldHype)
  const activityLog = useGameStore(s => s.activityLog)
  const clearActivity = useGameStore(s => s.clearActivity)
  const { notify } = useToast()
  const { clearOverrides } = useMapOverrides()

  const nextIndex = Math.min(STAGE_ORDER.indexOf(player.round) + 1, STAGE_ORDER.length - 1)
  const next = STAGE_ORDER[nextIndex] ?? player.round
  const mult = economy.round_multipliers[next] ?? 1.3
  const dil = economy.dilution_ranges[next] ?? [0.15, 0.25]

  const categoryStats = useMemo(() => {
    const counts: Record<FirmCategory, number> = CATEGORY_ORDER.reduce((acc, cat) => {
      acc[cat] = 0
      return acc
    }, {} as Record<FirmCategory, number>)
    for (const firm of firms) counts[firm.category as FirmCategory] = (counts[firm.category as FirmCategory] ?? 0) + 1
    return CATEGORY_ORDER.map((cat) => ({ cat, count: counts[cat] ?? 0 }))
  }, [firms])

  const stageStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const stage of STAGE_ORDER) counts[stage] = 0
    for (const firm of firms) counts[firm.round_stage ?? ''] = (counts[firm.round_stage ?? ''] ?? 0) + 1
    return STAGE_ORDER.map((stage) => ({ stage, label: STAGE_SHORT[stage], count: counts[stage] ?? 0 }))
  }, [firms])

  return (
    <div className="h-full p-3 overflow-auto grid gap-3">
      <div className="rounded-lg glass p-3">
        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground/60 mb-3">Market Snapshot</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {categoryStats.map(({ cat, count }) => (
            <div key={cat} className="rounded-xl border border-white/10 bg-white/4 px-3 py-2 flex items-center justify-between">
              <span className="font-medium" style={{ color: CATEGORY_HEX[cat] }}>{cat}</span>
              <span className="text-foreground/70">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.12em] text-foreground/70">
          {stageStats.map(({ stage, label, count }) => (
            <div key={stage} className="rounded-lg border border-white/8 bg-white/3 px-2 py-1.5 flex items-center justify-between">
              <span className="font-semibold">{label}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg glass p-3 space-y-2">
        <div className="text-sm font-medium">Rounds</div>
        <div className="text-xs text-muted-foreground">Next: {next} · Multiplier ≈ {mult} · Dilution mid {( (dil[0]+dil[1])/2 * 100).toFixed(0)}%</div>
        <button
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
          onClick={()=>{ raiseRound(mult, dil); notify(`Raised ${next} round`) }}
          data-cursor="interactive"
        >
          Raise Next Round
        </button>
      </div>

      <div className="rounded-lg glass p-3 space-y-3">
        <div className="text-sm font-medium">Economy</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Hype:</span>
          {(['bear','neutral','bull'] as const).map(h => (
            <button
              key={h}
              onClick={()=> setWorldHype(h)}
              className={`px-2 py-0.5 rounded ${worldHype===h?'bg-accent text-[hsl(20,14%,4%)]':'bg-secondary/60'}`}
              data-cursor="interactive"
            >
              {h}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Round multipliers: {Object.keys(economy.round_multipliers).length ? JSON.stringify(economy.round_multipliers) : 'default rules active'}
        </div>
      </div>

      <div className="rounded-lg glass p-3 space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Activity</span>
          <button
            className="text-[11px] uppercase tracking-[0.12em] text-foreground/50 hover:text-foreground/80"
            onClick={() => clearActivity()}
            data-cursor="interactive"
          >
            Clear
          </button>
        </div>
        <ul className="space-y-2 text-xs text-foreground/70 max-h-32 overflow-auto pr-1">
          {activityLog.length === 0 && <li className="text-muted-foreground/70">No recent activity</li>}
          {activityLog.map(entry => (
            <li key={entry.id} className="flex items-start gap-2">
              <span className="text-foreground/50 min-w-[48px]">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg glass p-3">
        <div className="text-sm font-medium mb-2">Data & Cache</div>
        <button
          className="px-2 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80"
          onClick={()=>{ try { localStorage.removeItem('geocodeCacheV1') } catch {} clearOverrides(); notify('Geocode cache cleared.'); }}
          data-cursor="interactive"
        >
          Clear Geocode Cache
        </button>
      </div>
    </div>
  )
}
