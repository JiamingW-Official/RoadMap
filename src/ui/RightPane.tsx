import { useMemo, useState, useRef } from 'react'
import { useContentCtx } from './providers/ContentProvider'
import { useToast } from '../components/ui/toast'
import { useGameStore } from '../store/game'
import type { RoundKey } from '../store/game'
import { useMapOverrides } from '../store/mapOverrides'
import { CATEGORY_ORDER, CATEGORY_HEX } from '../constants/categories'
import type { FirmCategory } from '../types/firm'
import { getHeadlines } from '../data/headlines'

const STAGE_ORDER: RoundKey[] = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'IPO', 'Post-IPO']
const STAGE_SHORT: Record<RoundKey, string> = {
  'Pre-Seed': 'PRE',
  Seed: 'SEED',
  'Series A': 'A',
  'Series B': 'B',
  'Series C': 'C',
  IPO: 'IPO',
  'Post-IPO': 'POST',
}

const INVEST_OPTIONS = [5000, 10000, 25000]
const FOUNDER_BASE_SHARES = 1_000_000

type ValuationPoint = { date: string; valuation: number }
type ChartPoint = ValuationPoint & { x: number; y: number }

const DEFAULT_VALUATION_SERIES: ValuationPoint[] = [
  { date: '1970-01-01', valuation: 0 },
  { date: '1970-01-08', valuation: 0 },
]

function CategoryBarChart({ data, max }: { data: { cat: FirmCategory; count: number }[]; max: number }) {
  const barWidth = 36
  const chartHeight = 90
  return (
    <svg viewBox={`0 0 ${data.length * barWidth} ${chartHeight}`} className="w-full h-28">
      {data.map(({ cat, count }, idx) => {
        const height = Math.max((count / max) * (chartHeight - 28), 6)
        const x = idx * barWidth + barWidth / 4
        const y = chartHeight - height - 18
        const labelParts = cat.split(' ')
        return (
          <g key={cat}>
            <rect x={x} y={y} width={barWidth / 2} height={height} rx={6} fill={`${CATEGORY_HEX[cat]}AA`} />
            <text x={x + barWidth / 4} y={chartHeight - 14} fontSize="9" fill="rgba(226,232,240,0.7)" textAnchor="middle">
              {count}
            </text>
            <text x={x + barWidth / 4} y={chartHeight - 5} fontSize="8" fill="rgba(148,163,184,0.65)" textAnchor="middle">
              {labelParts[0]}
            </text>
            {labelParts.length > 1 && (
              <text x={x + barWidth / 4} y={chartHeight + 4} fontSize="8" fill="rgba(148,163,184,0.65)" textAnchor="middle">
                {labelParts.slice(1).join(' ')}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function StageBarChart({ data, max }: { data: { stage: RoundKey; label: string; count: number }[]; max: number }) {
  const chartWidth = 180
  const rowHeight = 16
  return (
    <svg viewBox={`0 0 ${chartWidth} ${data.length * rowHeight}`} className="w-full h-28">
      {data.map(({ label, count }, idx) => {
        const width = Math.max((count / max) * (chartWidth - 50), 4)
        const y = idx * rowHeight + 12
        return (
          <g key={label}>
            <text x={0} y={y} fontSize="9" fill="rgba(148, 163, 184, 0.7)">{label}</text>
            <rect x={40} y={y - 8} width={width} height={6} rx={3} fill="rgba(129, 140, 248, 0.6)" />
            <text x={40 + width + 4} y={y} fontSize="9" fill="rgba(226,232,240,0.7)">{count}</text>
          </g>
        )
      })}
    </svg>
  )
}

function ValuationChart({ data }: { data: Array<{ date: string; valuation: number }> }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [window, setWindow] = useState(() => {
    const end = Math.max(data.length - 1, 0)
    const start = Math.max(end - 8, 0)
    return { start, end }
  })
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const dragState = useRef<{ pointerId: number; startX: number; startWindow: { start: number; end: number } } | null>(null)

  const width = 280
  const height = 140
  const margin = { left: 40, right: 16, top: 16, bottom: 28 }

  const clampedStart = Math.max(0, Math.min(window.start, Math.max(data.length - 2, 0)))
  const clampedEnd = Math.max(clampedStart + 1, Math.min(window.end, data.length - 1))
  const rawVisible = data.slice(clampedStart, clampedEnd + 1)
  const hasEnough = rawVisible.length >= 2
  const firstVisible = rawVisible[0]
  const safeVisible: ValuationPoint[] = hasEnough
    ? rawVisible
    : firstVisible
      ? [firstVisible, firstVisible]
      : DEFAULT_VALUATION_SERIES

  const minVal = Math.min(...safeVisible.map((p) => p.valuation))
  const maxVal = Math.max(...safeVisible.map((p) => p.valuation))
  const yRange = Math.max(maxVal - minVal, 1)
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const clampIndex = (index: number, length: number) => {
    if (length <= 0) return 0
    return Math.min(length - 1, Math.max(index, 0))
  }

  const points: ChartPoint[] = safeVisible.map((p, idx) => {
    const x = margin.left + (idx / Math.max(safeVisible.length - 1, 1)) * chartWidth
    const y = margin.top + (1 - (p.valuation - minVal) / yRange) * chartHeight
    return { ...p, x, y }
  })

  const path = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(' ')

  const ticksX = useMemo(() => {
    if (!points.length) return []
    const count = Math.min(4, points.length)
    return Array.from({ length: count }, (_, i) => {
      const idx = clampIndex(Math.round((i / Math.max(count - 1, 1)) * (points.length - 1)), points.length)
      return points[idx]!
    })
  }, [points])

  const ticksY = useMemo(() => {
    const count = 4
    return Array.from({ length: count }, (_, i) => minVal + (i / (count - 1)) * yRange)
  }, [minVal, yRange])

  const updateWindow = (nextStart: number) => {
    const span = window.end - window.start
    const start = Math.max(0, Math.min(nextStart, Math.max(data.length - span - 1, 0)))
    const end = Math.min(start + span, data.length - 1)
    setWindow({ start, end })
  }

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    svgRef.current.setPointerCapture(event.pointerId)
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startWindow: { ...window } }
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const ratio = (x - margin.left) / chartWidth
    const index = clampIndex(Math.round(ratio * (points.length - 1)), points.length)
    setHoverIndex(index)

    if (dragState.current) {
      const { startX, startWindow } = dragState.current
      const dx = event.clientX - startX
      const deltaIndex = Math.round((-dx / chartWidth) * (startWindow.end - startWindow.start))
      updateWindow(startWindow.start + deltaIndex)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !dragState.current) return
    svgRef.current.releasePointerCapture(event.pointerId)
    dragState.current = null
  }

  const handlePointerLeave = () => {
    setHoverIndex(null)
    dragState.current = null
  }

  const handleDoubleClick = () => {
    setWindow(() => {
      const end = Math.max(data.length - 1, 0)
      const start = Math.max(end - 8, 0)
      return { start, end }
    })
  }

  const activePoint =
    hoverIndex != null && points.length ? points[clampIndex(hoverIndex, points.length)] ?? null : null

  return (
    <div className="rounded-lg glass p-3 space-y-2">
      <div className="text-sm font-medium flex items-center justify-between">
        <span>Valuation</span>
        <span className="text-xs text-foreground/60">Double-click reset · Drag to pan</span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
      >
        <rect x={margin.left} y={margin.top} width={chartWidth} height={chartHeight} fill="rgba(15,23,42,0.3)" rx={8} />
        <path d={`M${margin.left} ${height - margin.bottom} H${width - margin.right}`} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
        <path d={`M${margin.left} ${margin.top} V${height - margin.bottom}`} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />

        {ticksX.map((tick, idx) => (
          <g key={`x-${idx}`}>
            <path d={`M${tick.x} ${margin.top} V${height - margin.bottom}`} stroke="rgba(148,163,184,0.1)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={tick.x} y={height - margin.bottom + 16} fontSize="9" fill="rgba(148,163,184,0.6)" textAnchor="middle">
              {new Date(tick.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
            </text>
          </g>
        ))}

        {ticksY.map((val, idx) => {
          const y = margin.top + (1 - (val - minVal) / yRange) * chartHeight
          return (
            <g key={`y-${idx}`}>
              <path d={`M${margin.left} ${y} H${width - margin.right}`} stroke="rgba(148,163,184,0.1)" strokeWidth="1" strokeDasharray="2 3" />
              <text x={margin.left - 8} y={y + 3} fontSize="9" fill="rgba(148,163,184,0.6)" textAnchor="end">
                ${Math.round(val).toLocaleString()}
              </text>
            </g>
          )
        })}

        <path d={path} stroke="rgba(96,165,250,0.8)" strokeWidth="2" fill="none" />

        {activePoint && (
          <g>
            <path d={`M${activePoint.x} ${margin.top} V${height - margin.bottom}`} stroke="rgba(96,165,250,0.4)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={activePoint.x} cy={activePoint.y} r={4} fill="rgba(96,165,250,0.9)" />
            <rect x={activePoint.x + 8} y={activePoint.y - 28} width={110} height={32} rx={6} fill="rgba(15,23,42,0.85)" stroke="rgba(96,165,250,0.4)" />
            <text x={activePoint.x + 14} y={activePoint.y - 12} fontSize="9" fill="rgba(226,232,240,0.9)">
              {new Date(activePoint.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </text>
            <text x={activePoint.x + 14} y={activePoint.y - 2} fontSize="10" fill="rgba(226,232,240,0.95)" fontWeight="700">
              ${activePoint.valuation.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
      {!hasEnough && (
        <div className="text-xs text-foreground/60">
          Not enough historical data – displaying baseline trend.
        </div>
      )}
    </div>
  )
}

export function RightPane() {
  const { economy, firms } = useContentCtx()
  const player = useGameStore((s) => s.player)
  const advanceWeek = useGameStore((s) => s.advanceWeek)
  const currentDate = useGameStore((s) => s.currentDate)
  const actionsRemaining = useGameStore((s) => s.actionsRemaining)
  const raiseRound = useGameStore((s) => s.raiseRound)
  const investCapital = useGameStore((s) => s.investCapital)
  const financials = useGameStore((s) => s.financials)
  const board = useGameStore((s) => s.board)
  const canAct = useGameStore((s) => s.canActThisWeek())
  const worldHype = useGameStore((s) => s.world.hype)
  const setWorldHype = useGameStore((s) => s.setWorldHype)
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
    const counts: Record<RoundKey, number> = {
      'Pre-Seed': 0,
      Seed: 0,
      'Series A': 0,
      'Series B': 0,
      'Series C': 0,
      IPO: 0,
      'Post-IPO': 0,
    }
    for (const firm of firms) {
      if (firm.round_stage && counts[firm.round_stage as RoundKey] !== undefined) {
        counts[firm.round_stage as RoundKey] += 1
      }
    }
    return STAGE_ORDER.map((stage) => ({ stage, label: STAGE_SHORT[stage], count: counts[stage] ?? 0 }))
  }, [firms])

  const formattedDate = useMemo(() => {
    const date = new Date(currentDate)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }, [currentDate])

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1)
  const maxStageCount = Math.max(...stageStats.map((s) => s.count), 1)

  const equity = Math.max(financials.assets - financials.liabilities, 0)
  const balanceBars = useMemo(() => {
    const maxValue = Math.max(financials.assets, financials.liabilities, equity, 1)
    const scale = (value: number) => `${Math.max((value / maxValue) * 100, 3)}%`
    return [
      { label: 'Assets', value: financials.assets, width: scale(financials.assets), color: 'bg-sky-500/70' },
      { label: 'Liabilities', value: financials.liabilities, width: scale(financials.liabilities), color: 'bg-rose-500/70' },
      { label: 'Equity', value: equity, width: scale(equity), color: 'bg-emerald-500/70' },
    ]
  }, [financials.assets, financials.liabilities, equity])

  const cashFlowBars = useMemo(() => {
    const values = [financials.cashFlow.operating, financials.cashFlow.investing, financials.cashFlow.financing]
    const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1)
    return [
      { label: 'Operating', value: financials.cashFlow.operating },
      { label: 'Investing', value: financials.cashFlow.investing },
      { label: 'Financing', value: financials.cashFlow.financing },
    ].map((item) => {
      const width = Math.max((Math.abs(item.value) / maxAbs) * 100, 3)
      const color = item.value >= 0 ? 'bg-emerald-500/70' : 'bg-rose-500/70'
      return { ...item, width: `${width}%`, color }
    })
  }, [financials.cashFlow.operating, financials.cashFlow.investing, financials.cashFlow.financing])

  const founderShares = Math.min(player.shares, FOUNDER_BASE_SHARES)
  const totalShares = Math.max(player.shares, FOUNDER_BASE_SHARES)
  const investorShares = Math.max(totalShares - founderShares, 0)
  const founderPct = totalShares ? founderShares / totalShares : 1
  const investorPct = 1 - founderPct
  const pieGradient = `conic-gradient(#F5C518 0 ${founderPct * 360}deg, rgba(99,102,241,0.75) ${founderPct * 360}deg 360deg)`

  const headlines = getHeadlines(currentDate)

  const handleInvest = (amount: number) => {
    const ok = investCapital(amount)
    if (ok) notify(`Invested $${amount.toLocaleString()} toward growth initiatives`)
    else notify(amount > player.cash ? 'Insufficient cash for this investment' : 'No actions remaining this week')
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'market'>('overview')

  return (
    <div className="h-full px-2.5 md:px-3 py-3 md:py-3.5 overflow-auto thin-scroll flex flex-col gap-2.5 text-sm">
      <div className="flex items-center justify-between rounded-lg glass px-3 py-2.5 text-xs uppercase tracking-[0.12em]">
        <button
          className={`rounded-md px-3 py-1 font-semibold transition ${
            activeTab === 'overview' ? 'bg-white/20 text-foreground' : 'text-foreground/50 hover:text-foreground/80'
          }`}
          onClick={() => setActiveTab('overview')}
          data-cursor="interactive"
        >
          Overview
        </button>
        <button
          className={`rounded-md px-3 py-1 font-semibold transition ${
            activeTab === 'market' ? 'bg-white/20 text-foreground' : 'text-foreground/50 hover:text-foreground/80'
          }`}
          onClick={() => setActiveTab('market')}
          data-cursor="interactive"
        >
          Market Intel
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-1.5">
          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Current Week</div>
                <div className="text-lg font-semibold text-foreground/90">{formattedDate}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Actions Left</div>
                <div className="text-base font-semibold">{actionsRemaining}</div>
              </div>
            </div>
            <button
              className="w-full rounded-md bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-secondary/80"
              onClick={() => {
                advanceWeek()
                notify('Advanced to next week')
              }}
              data-cursor="interactive"
            >
              Advance Week
            </button>
          </div>

          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Rounds</div>
                <div className="text-base font-semibold text-foreground/90">Funding Momentum</div>
              </div>
              <span className="text-xs text-muted-foreground bg-white/10 px-2 py-1 rounded-md border border-white/10">
                Next: {next}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Multiplier ≈ {mult} · Dilution mid {(((dil[0] + dil[1]) / 2) * 100).toFixed(0)}%
            </div>
            <button
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              disabled={!canAct}
              onClick={() => {
                const ok = raiseRound(mult, dil)
                if (ok) notify(`Raised ${next} round`)
                else notify('No actions remaining this week. Advance to next week.')
              }}
              data-cursor="interactive"
            >
              Raise Next Round
            </button>
            {!canAct && <div className="text-xs text-muted-foreground">Action limit reached. Advance the week to continue.</div>}
          </div>

          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Economy</div>
                <div className="text-base font-semibold text-foreground/90">Macro Signal</div>
              </div>
              <span className="text-xs text-muted-foreground bg-white/10 px-2 py-1 rounded-md border border-white/10">
                Hype {worldHype.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Hype:</span>
              {(['bear','neutral','bull'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setWorldHype(mode)}
                  className={`px-2 py-0.5 rounded ${worldHype === mode ? 'bg-accent text-[hsl(20,14%,4%)]' : 'bg-secondary/60'}`}
                  data-cursor="interactive"
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Round multipliers: {Object.keys(economy.round_multipliers).length ? JSON.stringify(economy.round_multipliers) : 'default rules active'}
            </div>
          </div>

          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Finance Overview</div>
            <div className="text-base font-semibold text-foreground/90">Balance Snapshot</div>
            <div className="space-y-1.5 text-xs">
              {balanceBars.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-foreground/60">
                    <span>{item.label}</span>
                    <span className="text-foreground/80">${item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs">
              <div className="text-foreground/60 font-medium">Cash Flow (YTD)</div>
              {cashFlowBars.map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span className="min-w-[72px] text-foreground/60">{item.label}</span>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                  <span className="w-16 text-right text-foreground/80">${item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-1 text-foreground/70">Free Cash Flow: ${financials.cashFlow.freeCashFlow.toLocaleString()}</div>
            </div>
          </div>

          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Valuation</div>
            <ValuationChart data={financials.valuationHistory} />
          </div>

          <div className="rounded-xl glass interactive-panel p-2 md:p-3 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Cap Table & Board</div>
                <div className="text-base font-semibold text-foreground/90">Ownership Mix</div>
              </div>
              <span className="text-xs text-muted-foreground bg-white/10 px-2 py-1 rounded-md border border-white/10">
                Shares {totalShares.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative h-28 w-28 rounded-full" style={{ background: pieGradient }}>
                <div className="absolute inset-[22%] rounded-full bg-background/90" />
              </div>
              <div className="text-xs space-y-2">
                <div className="flex items-center gap-2 text-foreground/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F5C518]" /> Founder {Math.round(founderPct * 100)}%
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-400/80" /> Investors {Math.round(investorPct * 100)}%
                </div>
                <div className="text-foreground/60">Outstanding shares: {totalShares.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-xs text-foreground/60 space-y-1">
              <div className="uppercase tracking-[0.12em] text-foreground/50">Board Seats</div>
              {board.length === 0 ? (
                <div className="text-muted-foreground/70">No external board members</div>
              ) : (
                <ul className="space-y-1">
                  {board.map((member) => (
                    <li key={member} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                      <span>{member}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl glass p-4 md:p-5 space-y-4">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Invest</div>
            <div className="text-base font-semibold text-foreground/90">Deploy Capital</div>
            <div className="text-xs text-foreground/60">
              Deploy cash into strategic initiatives. Consumes this week&apos;s action.
            </div>
            <div className="flex flex-wrap gap-2">
              {INVEST_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 disabled:opacity-40"
                  disabled={!canAct || amount > player.cash}
                  onClick={() => handleInvest(amount)}
                  data-cursor="interactive"
                >
                  Invest ${amount >= 1000 ? `${amount / 1000}K` : amount}
                </button>
              ))}
              <button
                className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
                onClick={() => {
                  clearOverrides()
                  try {
                    localStorage.removeItem('geocodeCacheV1')
                  } catch {}
                  notify('Geocode cache cleared.')
                }}
                data-cursor="interactive"
              >
                Clear Geocode Cache
              </button>
            </div>
          </div>

          <div className="rounded-xl glass p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Economic Headlines</div>
                <div className="text-base font-semibold text-foreground/90">Market Pulse</div>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-foreground/70">
              {headlines.map((headline, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400/80" />
                  <span>{headline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl glass p-4 md:p-5 space-y-4">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Category Mix</div>
            <CategoryBarChart data={categoryStats} max={maxCategoryCount} />
          </div>

          <div className="rounded-xl glass p-4 md:p-5 space-y-4">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Stage Distribution</div>
            <StageBarChart data={stageStats} max={maxStageCount} />
          </div>

          <div className="rounded-xl glass p-4 md:p-5 space-y-3">
            <div className="text-xs uppercase tracking-[0.12em] text-foreground/50">Economic Headlines</div>
            <ul className="space-y-2 text-xs text-foreground/70">
              {headlines.map((headline, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400/80" />
                  <span>{headline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
