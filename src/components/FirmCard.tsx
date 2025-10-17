import * as React from 'react'
import type { FirmInput } from '../content/schema'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { useGameStore } from '../store/game'
import { useToast } from './ui/toast'

interface FirmCardProps {
  firm: FirmInput
  selected?: boolean
  onSelect?: () => void
}

const stageColors: Record<string, { bg: string; border: string; text: string }> = {
  'Pre-Seed': { bg: 'rgba(250, 204, 21, 0.12)', border: 'rgba(250, 204, 21, 0.45)', text: 'rgba(250, 204, 21, 0.92)' },
  Seed: { bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.45)', text: 'rgba(96, 165, 250, 0.95)' },
  'Series A': { bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.45)', text: 'rgba(167, 139, 250, 0.95)' },
  'Series B': { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.45)', text: 'rgba(74, 222, 128, 0.95)' },
  'Series C': { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.45)', text: 'rgba(56, 189, 248, 0.95)' },
  'Series D': { bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.45)', text: 'rgba(244, 114, 182, 0.95)' },
  IPO: { bg: 'rgba(250, 204, 21, 0.2)', border: 'rgba(250, 204, 21, 0.6)', text: 'rgba(250, 204, 21, 1)' },
  'Post-IPO': { bg: 'rgba(147, 197, 253, 0.12)', border: 'rgba(147, 197, 253, 0.45)', text: 'rgba(191, 219, 254, 0.95)' },
}

const stageShortMap: Record<string, string> = {
  'Pre-Seed': 'PRE',
  Seed: 'SEED',
  'Series A': 'A',
  'Series B': 'B',
  'Series C': 'C',
  'Series D': 'D',
  IPO: 'IPO',
  'Post-IPO': 'POST',
}

export function FirmCard({ firm, selected = false, onSelect }: FirmCardProps) {
  const applyDeal = useGameStore((s) => s.applyDeal)
  const { notify } = useToast()
  const stageRaw = firm.round_stage ?? 'Stage'
  const stageLabel = stageShortMap[stageRaw] ?? stageRaw
  const stageStyle = stageColors[stageRaw] ?? { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', text: 'rgba(226,232,240,0.82)' }

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-background/45 backdrop-blur-md transition-all duration-200',
        selected
          ? 'border-accent/70 bg-background/70 shadow-[0_18px_45px_-25px_rgba(234,179,8,0.75)]'
          : 'hover:border-white/20 hover:bg-background/60'
      )}
      data-cursor="panel"
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
          selected ? 'bg-white/6' : 'hover:bg-white/4'
        )}
        data-cursor="interactive"
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground/95">{firm.firm_name}</span>
          <span className="text-xs text-foreground/55">{firm.category}</span>
        </div>
        <span
          className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ background: stageStyle.bg, borderColor: stageStyle.border, color: stageStyle.text }}
        >
          {stageLabel}
        </span>
      </button>
      {selected && (
        <div className="space-y-3 px-4 pb-4 pt-2 text-sm text-foreground/80">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-foreground/50">Address</p>
            <p>{firm.hq_address}, {firm.city}, {firm.state}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.12em] text-foreground/60">
            <div className="flex items-center gap-2">
              <span>Difficulty</span>
              <div className="flex gap-1">
                {Array.from({ length: firm.difficulty_level ?? 0 }).map((_, i) => (
                  <span key={i} className="h-5 w-5 rounded-full bg-white/10 text-[11px] font-medium text-foreground/80 flex items-center justify-center">
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Cost</span>
              <div className="flex gap-1">
                {Array.from({ length: firm.cost_level ?? 0 }).map((_, i) => (
                  <span key={i} className="h-5 w-5 rounded-full bg-white/10 text-[11px] font-medium text-foreground/80 flex items-center justify-center">
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {firm.website ? (
              <Button
                asChild
                size="sm"
                variant="secondary"
                data-cursor="interactive"
                onClick={(e) => e.stopPropagation()}
              >
                <a href={firm.website} target="_blank" rel="noreferrer">Open Website</a>
              </Button>
            ) : (
              <Button size="sm" disabled onClick={(e) => e.stopPropagation()}>No Website</Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                applyDeal(firm)
                notify(`Deal success with ${firm.firm_name}`)
              }}
              data-cursor="interactive"
            >
              Deal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
