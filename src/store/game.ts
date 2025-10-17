import { create } from 'zustand'
import type { FirmInput } from '../content/schema'
import { founderOwnershipAfter, issueNewShares } from '../lib/math'

export type RoundKey = 'Pre-Seed'|'Seed'|'Series A'|'Series B'|'Series C'|'IPO'|'Post-IPO'

interface PlayerState {
  cash: number
  shares: number
  reputation: number
  round: RoundKey
  valuation: number
}

interface WorldState {
  hype: 'bear'|'neutral'|'bull'
}

interface ActivityEntry {
  id: number
  message: string
  timestamp: number
}

interface GameState {
  player: PlayerState
  world: WorldState
  activityLog: ActivityEntry[]
  addActivity: (message: string) => void
  clearActivity: () => void
  setWorldHype: (hype: WorldState['hype']) => void
  applyDeal: (firm: FirmInput) => void
  raiseRound: (multiplier: number, dilutionRange?: [number, number]) => void
  advanceTurn: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { cash: 100000, shares: 1000000, reputation: 20, round: 'Pre-Seed', valuation: 1000000 },
  world: { hype: 'neutral' },
  activityLog: [],
  addActivity: (message) => set((state) => {
    const entry: ActivityEntry = { id: Date.now(), message, timestamp: Date.now() }
    return { activityLog: [entry, ...state.activityLog].slice(0, 30) }
  }),
  clearActivity: () => set({ activityLog: [] }),
  setWorldHype: (hype) => set((state) => {
    const entry: ActivityEntry = { id: Date.now(), message: `Market mode set to ${hype.toUpperCase()}`, timestamp: Date.now() }
    return {
      world: { ...state.world, hype },
      activityLog: [entry, ...state.activityLog].slice(0, 30),
    }
  }),
  applyDeal: (firm) => set((state) => {
    const p = { ...state.player }
    const valRate = firm.valuation_increase_rate ?? 1.1
    const dilRate = firm.equity_dilution_rate ?? 0.05
    const repEff = firm.reputation_effect ?? 1
    p.valuation = Math.round(p.valuation * valRate)
    const newShares = Math.round(p.shares * dilRate)
    p.shares += newShares
    p.reputation = Math.max(0, p.reputation + repEff)
    const entry: ActivityEntry = { id: Date.now(), message: `Deal with ${firm.firm_name}`, timestamp: Date.now() }
    return { player: p, activityLog: [entry, ...state.activityLog].slice(0, 30) }
  }),
  raiseRound: (multiplier, dilutionRange) => set((state) => {
    const p = { ...state.player }
    const nextVal = Math.round(p.valuation * (multiplier || 1))
    const [minDil, maxDil] = dilutionRange ?? [0.15, 0.25]
    const midDil = (minDil + maxDil) / 2
    const newShares = Math.round(p.shares * midDil)
    p.shares += newShares
    p.valuation = nextVal
    const order: RoundKey[] = ['Pre-Seed','Seed','Series A','Series B','Series C','IPO','Post-IPO']
    const idx = Math.min(order.indexOf(p.round) + 1, order.length - 1)
    p.round = order[idx] ?? p.round
    const entry: ActivityEntry = { id: Date.now(), message: `Raised ${p.round} round`, timestamp: Date.now() }
    return { player: p, activityLog: [entry, ...state.activityLog].slice(0, 30) }
  }),
  advanceTurn: () => set((state) => ({ world: state.world })),
}))
