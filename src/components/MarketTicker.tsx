import * as React from 'react'
import { getMarketSnapshot, previousWeek } from '../data/market'
import { useGameStore } from '../store/game'

type TickerEntry = {
  id: string
  label: string
  value: number
  changePct: number
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

function buildEntries(currentDate: string): TickerEntry[] {
  const entry = getMarketSnapshot(currentDate)
  const prevDate = previousWeek(currentDate)
  const prev = prevDate !== currentDate ? getMarketSnapshot(prevDate) : undefined

  const calc = (curr: number, prevVal?: number) => {
    if (!prevVal || prevVal === 0) return 0
    return ((curr - prevVal) / prevVal) * 100
  }

  return [
    { id: `${entry.date}-sp500`, label: `S&P 500`, value: entry.sp500, changePct: calc(entry.sp500, prev?.sp500) },
    { id: `${entry.date}-nasdaq`, label: `NASDAQ`, value: entry.nasdaq, changePct: calc(entry.nasdaq, prev?.nasdaq) },
    { id: `${entry.date}-dow`, label: `Dow Jones`, value: entry.dowjones, changePct: calc(entry.dowjones, prev?.dowjones) },
    { id: `${entry.date}-ftse`, label: `FTSE 100`, value: entry.ftse100, changePct: calc(entry.ftse100, prev?.ftse100) },
    { id: `${entry.date}-hangseng`, label: `Hang Seng`, value: entry.hangSeng, changePct: calc(entry.hangSeng, prev?.hangSeng) },
    { id: `${entry.date}-nikkei`, label: `Nikkei 225`, value: entry.nikkei, changePct: calc(entry.nikkei, prev?.nikkei) },
    { id: `${entry.date}-shanghai`, label: `Shanghai Comp`, value: entry.shanghai, changePct: calc(entry.shanghai, prev?.shanghai) },
    { id: `${entry.date}-vix`, label: `VIX`, value: entry.vix, changePct: calc(entry.vix, prev?.vix) },
  ]
}

function renderChange(change: number) {
  if (!Number.isFinite(change) || change === 0) {
    return <span className="text-foreground/60 ml-2">0.00%</span>
  }
  const up = change > 0
  const color = up ? 'text-emerald-400' : 'text-red-400'
  const arrow = up ? '▲' : '▼'
  return (
    <span className={`ml-2 flex items-center gap-1 text-xs font-semibold ${color}`}>
      <span>{arrow}</span>
      <span>{Math.abs(change).toFixed(2)}%</span>
    </span>
  )
}

export function MarketTicker() {
  const currentDate = useGameStore((s) => s.currentDate)
  const entries = React.useMemo(() => buildEntries(currentDate), [currentDate])
  const weekLabel = React.useMemo(() => {
    const date = new Date(currentDate)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [currentDate])

  return (
    <div className="pointer-events-none fixed bottom-0 inset-x-0 z-[3000] overflow-hidden border-t border-white/10 bg-background/80 backdrop-blur">
      <div className="px-6 py-1 text-[10px] uppercase tracking-[0.15em] text-foreground/50">Week of {weekLabel}</div>
      <div key={currentDate} className="pointer-events-auto flex w-[200%] animate-[marquee_35s_linear_infinite] gap-6 px-6 pb-2 text-sm text-foreground/80">
        {[...entries, ...entries].map((item, idx) => (
          <div key={`${item.id}-${idx >= entries.length ? 'clone' : 'base'}`} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-xs uppercase tracking-[0.12em] text-foreground/50">{item.label}</span>
            <span className="font-semibold text-foreground/90">{formatter.format(item.value)}</span>
            {renderChange(item.changePct)}
          </div>
        ))}
      </div>
    </div>
  )
}
