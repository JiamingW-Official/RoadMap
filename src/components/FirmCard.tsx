import * as React from 'react'
import type { FirmInput } from '../content/schema'
import type { FirmCategory } from '../types/firm'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { useGameStore } from '../store/game'
import { useToast } from './ui/toast'
import { CATEGORY_HEX } from '../constants/categories'

// 滚动文本组件 - 自动跑马灯效果
function ScrollingText({ children, className }: { children: string; className?: string }) {
  const textRef = React.useRef<HTMLSpanElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = React.useState(false)

  React.useEffect(() => {
    const checkScroll = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth
        const containerWidth = containerRef.current.clientWidth
        console.log('Text width:', textWidth, 'Container width:', containerWidth, 'Should scroll:', textWidth > containerWidth)
        setShouldScroll(textWidth > containerWidth)
      }
    }
    
    checkScroll()
    const timer1 = setTimeout(checkScroll, 100)
    const timer2 = setTimeout(checkScroll, 500)
    const timer3 = setTimeout(checkScroll, 1000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [children])

  return (
    <div 
      ref={containerRef}
      className={cn('overflow-hidden', className)}
    >
      <span
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={{
          animation: shouldScroll ? 'scrollText 3s ease-in-out infinite' : 'none',
          animationDelay: '0.5s'
        }}
      >
        {children}
      </span>
    </div>
  )
}

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
  const canAct = useGameStore((s) => s.canActThisWeek())
  const { notify } = useToast()
  const stageRaw = firm.round_stage ?? 'Stage'
  const stageLabel = stageShortMap[stageRaw] ?? stageRaw
  const stageStyle = stageColors[stageRaw] ?? { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', text: 'rgba(226,232,240,0.82)' }
  const categoryColor = CATEGORY_HEX[firm.category as FirmCategory] ?? 'rgba(148,163,184,0.35)'

  return (
    <div
      className={cn(
        'group firm-card rounded-lg border border-white/10 bg-background/45 backdrop-blur-md transition-all duration-200 interactive-element',
        selected
          ? 'border-accent/70 bg-background/70 shadow-[0_8px_25px_-15px_rgba(234,179,8,0.75)]'
          : 'hover:border-white/20 hover:bg-background/60'
      )}
      data-cursor="panel"
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'relative flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors',
          selected ? 'bg-white/6' : 'hover:bg-white/4'
        )}
        data-cursor="interactive"
      >
        <span
          className="absolute left-2 top-3 bottom-3 w-1 rounded-full"
          style={{ background: categoryColor }}
          aria-hidden
        />
        <div className="flex flex-col flex-1 min-w-0 max-w-[170px] pl-2">
          <ScrollingText className="text-base font-semibold text-foreground/90 group-hover:text-foreground">
            {firm.firm_name}
          </ScrollingText>
        </div>
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] flex-shrink-0"
          style={{ background: stageStyle.bg, borderColor: stageStyle.border, color: stageStyle.text }}
        >
          {stageLabel}
        </span>
      </button>
      {selected && (
        <div className="space-y-2 px-3 pb-3 pt-1 text-xs text-foreground/80">
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
                const success = applyDeal(firm)
                if (success) notify(`Deal success with ${firm.firm_name}`)
                else notify('No actions remaining this week. Advance to the next week.')
              }}
              data-cursor="interactive"
              disabled={!canAct}
            >
              Deal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
