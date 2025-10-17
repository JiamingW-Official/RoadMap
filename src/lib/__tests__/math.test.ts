import { describe, it, expect } from 'vitest'
import { issueNewShares, founderOwnershipAfter } from '../math'

describe('math', () => {
  it('raises $1M at $4M pre -> ~80% founder ownership', () => {
    const oldShares = 1_000_000
    const preMoney = 4_000_000
    const investment = 1_000_000
    const newShares = issueNewShares(oldShares, preMoney, investment)
    const ownership = founderOwnershipAfter(oldShares, newShares)
    expect(ownership).toBeGreaterThan(0.79)
    expect(ownership).toBeLessThan(0.81)
  })

  it('throws on invalid preMoney', () => {
    expect(() => issueNewShares(1_000_000, 0, 1)).toThrow()
  })
})
