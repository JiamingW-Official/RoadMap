import { create } from 'zustand'
import type { FirmInput } from '../content/schema'

export type RoundKey = 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'IPO' | 'Post-IPO'

interface PlayerState {
  cash: number
  shares: number
  reputation: number
  round: RoundKey
  valuation: number
}

interface WorldState {
  hype: 'bear' | 'neutral' | 'bull'
}

interface CashFlowState {
  operating: number
  investing: number
  financing: number
  freeCashFlow: number
}

interface FinancialsState {
  assets: number
  liabilities: number
  cash: number
  invested: number
  cashFlow: CashFlowState
  valuationHistory: Array<{ date: string; valuation: number }>
}

interface GameState {
  player: PlayerState
  world: WorldState
  currentDate: string
  actionsRemaining: number
  financials: FinancialsState
  board: string[]
  setWorldHype: (hype: WorldState['hype']) => void
  applyDeal: (firm: FirmInput) => boolean
  raiseRound: (multiplier: number, dilutionRange?: [number, number]) => boolean
  investCapital: (amount: number) => boolean
  advanceWeek: () => void
  canActThisWeek: () => boolean
}

const START_DATE = '2022-06-06'
const FOUNDER_BASE_SHARES = 1_000_000

const roundOrder: RoundKey[] = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'IPO', 'Post-IPO']

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function nextWeek(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 7)
  return formatDate(d)
}

function parseCapitalRange(input?: string | null): number {
  if (!input) return 50000
  const matches = [...input.matchAll(/([\d,.]+)\s*(K|M|B)?/gi)]
  if (!matches.length) return 50000
  const values = matches.map((match) => {
    const amount = match[1]
    if (!amount) return 0
    const raw = parseFloat(amount.replace(/,/g, ''))
    if (!Number.isFinite(raw)) return 0
    const unit = match[2]?.toUpperCase()
    if (unit === 'B') return raw * 1_000_000_000
    if (unit === 'M') return raw * 1_000_000
    if (unit === 'K') return raw * 1_000
    return raw
  }).filter((n) => n > 0)
  if (!values.length) return 50000
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  return Math.max(Math.round(avg), 5000)
}

function normalizeFinancials(fin: FinancialsState): FinancialsState {
  const assets = fin.cash + fin.invested
  const equity = assets - fin.liabilities
  const freeCashFlow = fin.cashFlow.operating + fin.cashFlow.investing + fin.cashFlow.financing
  return {
    ...fin,
    assets,
    cashFlow: {
      ...fin.cashFlow,
      freeCashFlow,
    },
  }
}

function appendValuation(fin: FinancialsState, date: string, valuation: number): FinancialsState {
  const history = [...fin.valuationHistory]
  const last = history[history.length - 1]
  if (last && last.date === date) {
    history[history.length - 1] = { date, valuation }
  } else {
    history.push({ date, valuation })
  }
  return { ...fin, valuationHistory: history }
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { cash: 100000, shares: FOUNDER_BASE_SHARES, reputation: 20, round: 'Pre-Seed', valuation: 1_000_000 },
  world: { hype: 'neutral' },
  currentDate: START_DATE,
  actionsRemaining: 1,
  financials: normalizeFinancials({
    assets: 120000,
    liabilities: 20000,
    cash: 100000,
    invested: 20000,
    cashFlow: { operating: 0, investing: 0, financing: 0, freeCashFlow: 0 },
    valuationHistory: [{ date: START_DATE, valuation: 1_000_000 }],
  }),
  board: [],
  setWorldHype: (hype) => set((state) => ({ world: { ...state.world, hype } })),
  applyDeal: (firm) => {
    if (get().actionsRemaining <= 0) return false
    const amount = parseCapitalRange(firm.required_capital_usd) * 0.5 // assume midpoint tranche received immediately
    set((state) => {
      const player = { ...state.player, cash: state.player.cash + amount, valuation: Math.round(state.player.valuation * (firm.valuation_increase_rate ?? 1.05)) }
      const financials = normalizeFinancials(appendValuation({
        ...state.financials,
        cash: state.financials.cash + amount,
        cashFlow: {
          ...state.financials.cashFlow,
          financing: state.financials.cashFlow.financing + amount,
        },
      }, state.currentDate, player.valuation))
      const board = state.board.includes(firm.firm_name)
        ? state.board
        : [...state.board, firm.firm_name]
      return {
        player,
        financials,
        board,
        actionsRemaining: Math.max(0, state.actionsRemaining - 1),
      }
    })
    return true
  },
  raiseRound: (multiplier, dilutionRange) => {
    if (get().actionsRemaining <= 0) return false
    set((state) => {
      const player = { ...state.player }
      const nextValuation = Math.round(player.valuation * (multiplier || 1))
      const [minDil, maxDil] = dilutionRange ?? [0.15, 0.25]
      const midDil = (minDil + maxDil) / 2
      const newShares = Math.round(player.shares * midDil)
      player.shares += newShares
      const capitalRaised = Math.round(nextValuation * midDil)
      player.cash += capitalRaised
      const orderIndex = Math.min(roundOrder.indexOf(player.round) + 1, roundOrder.length - 1)
      player.round = roundOrder[orderIndex] ?? player.round
      player.valuation = nextValuation

      const financials = normalizeFinancials(appendValuation({
        ...state.financials,
        cash: state.financials.cash + capitalRaised,
        cashFlow: {
          ...state.financials.cashFlow,
          financing: state.financials.cashFlow.financing + capitalRaised,
        },
      }, state.currentDate, nextValuation))

      return {
        player,
        financials,
        actionsRemaining: Math.max(0, state.actionsRemaining - 1),
      }
    })
    return true
  },
  investCapital: (amount) => {
    if (amount <= 0 || get().actionsRemaining <= 0) return false
    if (amount > get().player.cash) return false
    set((state) => {
      const player = { ...state.player, cash: state.player.cash - amount }
      const financials = normalizeFinancials({
        ...state.financials,
        cash: state.financials.cash - amount,
        invested: state.financials.invested + amount,
        cashFlow: {
          ...state.financials.cashFlow,
          investing: state.financials.cashFlow.investing - amount,
        },
      })
      return {
        player,
        financials,
        actionsRemaining: Math.max(0, state.actionsRemaining - 1),
      }
    })
    return true
  },
  advanceWeek: () => set((state) => {
    const nextDate = nextWeek(state.currentDate)
    const financials = appendValuation(state.financials, nextDate, state.player.valuation)
    return {
      currentDate: nextDate,
      actionsRemaining: 1,
      financials,
    }
  }),
  canActThisWeek: () => get().actionsRemaining > 0,
}))
