const HEADLINES_MAP: Record<string, string[]> = {
  '2022-06-06': [
    'Fed signals further rate hikes as inflation pressures persist',
    'Tech rebound lifts Nasdaq despite macro headwinds',
    'Energy shares rally on supply concerns in Europe',
    'Venture funding cools but mega-deals still close',
    'IPO pipeline stalls awaiting clearer monetary outlook',
  ],
  '2022-06-13': [
    'Global markets sell off after hotter-than-expected CPI print',
    'Dollar index hits 20-year high as investors seek safety',
    'Crypto lenders face liquidity crunch amid price collapse',
    'US Treasury yield curve flattens toward inversion',
    'VCs eye down-round protections as valuations reset',
  ],
  '2022-06-20': [
    'Recession fears ease as commodities retreat from highs',
    'Corporate buybacks accelerate with valuations compressing',
    'Eurozone ministers push coordinated energy response',
    'Private credit funds step in as banks tighten lending',
    'Fintech layoffs signal shift from growth to efficiency',
  ],
  '2022-06-27': [
    'US consumer confidence weakens amid inflation worries',
    'SPAC redemptions surge as sponsors race to close deals',
    'Oil volatility persists while OPEC+ debates output',
    'PE firms stockpile dry powder for distressed assets',
    'Cross-border M&A slows on regulatory scrutiny',
  ],
  '2022-07-04': [
    'Payroll data shows labor market resilience despite slowdown',
    'Software multiples stabilize after Q2 earnings resets',
    'Sovereign wealth funds hunt bargains in public tech',
    'Bank regulators outline draft climate disclosure rules',
    'Renewable energy startups see surge in strategic interest',
  ],
  '2022-07-11': [
    'USD strength pressures emerging markets, triggers capital outflows',
    'VC bridge rounds grow as founders extend runway',
    'Semiconductor capacity expansions face supply bottlenecks',
    'US senate progresses chips act subsidy package',
    'Corporate treasurers pivot toward shorter duration instruments',
  ],
}

const FALLBACK_HEADLINES = [
  'Investors monitor earnings revisions for signs of slowdown',
  'Global supply chains continue gradual normalization',
  'Private markets focus on unit economics over growth at all costs',
  'Central banks coordinate messaging to anchor inflation expectations',
  'Startups prioritize profitability metrics to appeal to late-stage capital',
]

export function getHeadlines(date: string): string[] {
  if (HEADLINES_MAP[date]) return HEADLINES_MAP[date]
  // derive deterministic fallback based on date hash
  const hash = Array.from(date).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  if (FALLBACK_HEADLINES.length === 0) return []
  const defaultHeadline = FALLBACK_HEADLINES[0] ?? 'Market update unavailable'
  return FALLBACK_HEADLINES.map((_, idx) => {
    const offset = (hash + idx) % FALLBACK_HEADLINES.length
    const headline = FALLBACK_HEADLINES[offset]
    return headline ?? defaultHeadline
  })
}
