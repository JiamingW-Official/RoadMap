export function issueNewShares(oldShares: number, preMoney: number, investment: number) {
  if (preMoney <= 0) throw new Error("preMoney must be > 0")
  return Math.round(oldShares * (investment / preMoney))
}

export function founderOwnershipAfter(oldShares: number, newShares: number) {
  return oldShares / (oldShares + newShares)
}
