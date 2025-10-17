import { Link } from 'react-router-dom'
import * as React from 'react'
import { useContentCtx } from './providers/ContentProvider'
import { useGameStore } from '../store/game'

interface TopBarProps {
  onOpenPalette?: () => void
}

export function TopBar({ onOpenPalette }: TopBarProps) {
  const { source, setSource } = useContentCtx()
  const cash = useGameStore(s => s.player.cash)
  const valuation = useGameStore(s => s.player.valuation)
  const reputation = useGameStore(s => s.player.reputation)
  const shares = useGameStore(s => s.player.shares)
  const ownership = Math.round((1000000 / shares) * 100)
  return (
    <div className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/55 border-b border-border/60">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent/90" />
          <span className="font-semibold tracking-wide">NYC Startup → IPO Simulator</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Cash</span><span className="text-accent">${cash.toLocaleString()}</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Valuation</span><span>${(valuation/1_000_000).toFixed(1)}M</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Reputation</span><span>{reputation}</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Ownership</span><span>{ownership}%</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-xs bg-secondary/60 px-2 py-1 rounded-md">
            {(['base','json','csv','all'] as const).map(k => (
              <button key={k} onClick={()=>setSource(k)} className={`px-2 py-0.5 rounded ${source===k?'bg-accent text-[hsl(20,14%,4%)]':'hover:bg-secondary'}`}>{k.toUpperCase()}</button>
            ))}
          </div>
          <button
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-foreground/80 hover:bg-white/20"
            data-cursor="interactive"
          >
            Command
            <span className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] font-semibold">⌘K</span>
          </button>
          <Link to="/settings" className="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80">Settings</Link>
          <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">Help</button>
        </div>
      </div>
    </div>
  )
}
