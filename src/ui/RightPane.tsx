import { useGameStore } from '../store/game'
import { useContentCtx } from './providers/ContentProvider'

export function RightPane() {
  const { economy } = useContentCtx()
  const player = useGameStore(s => s.player)
  const raiseRound = useGameStore(s => s.raiseRound)
  const order: Array<typeof player.round> = ['Pre-Seed','Seed','Series A','Series B','Series C','IPO','Post-IPO']
  const idx = Math.min(order.indexOf(player.round) + 1, order.length - 1)
  const next = order[idx] ?? player.round
  const mult = economy.round_multipliers[next] ?? 1.3
  const dil = economy.dilution_ranges[next] ?? [0.15, 0.25]
  return (
    <div className="h-full p-3 overflow-auto">
      <div className="rounded-lg glass p-3">
        <div className="text-sm font-medium mb-2">Rounds / Economy</div>
        <div className="text-xs text-muted-foreground mb-2">Next: {next} · Multiplier ~ {mult} · Dilution mid {( (dil[0]+dil[1])/2 * 100).toFixed(0)}%</div>
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90" onClick={()=>raiseRound(mult, dil)} data-cursor="interactive">Raise Next Round</button>
      </div>
    </div>
  )
}
