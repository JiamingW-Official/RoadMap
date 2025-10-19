export type MarketSnapshot = {
  date: string
  sp500: number
  nasdaq: number
  dowjones: number
  ftse100: number
  hangSeng: number
  nikkei: number
  shanghai: number
  vix: number
}

export const MARKET_DATA: MarketSnapshot[] = [
  { date: '2022-06-06', sp500: 4108.54, nasdaq: 12012.73, dowjones: 32915.78, ftse100: 7533.15, hangSeng: 21806.18, nikkei: 27510.0, shanghai: 3241.76, vix: 24.52 },
  { date: '2022-06-13', sp500: 3674.84, nasdaq: 10798.35, dowjones: 29888.78, ftse100: 7208.81, hangSeng: 21067.99, nikkei: 26431.2, shanghai: 3315.43, vix: 31.13 },
  { date: '2022-06-20', sp500: 3911.74, nasdaq: 11607.62, dowjones: 31438.26, ftse100: 7089.22, hangSeng: 21274.57, nikkei: 26490.53, shanghai: 3281.74, vix: 27.23 },
  { date: '2022-06-27', sp500: 3825.33, nasdaq: 11127.85, dowjones: 30775.43, ftse100: 7168.65, hangSeng: 21996.89, nikkei: 26813.62, shanghai: 3405.43, vix: 26.7 },
  { date: '2022-07-04', sp500: 3899.38, nasdaq: 11727.27, dowjones: 31338.15, ftse100: 7209.86, hangSeng: 21340.74, nikkei: 26517.19, shanghai: 3231.76, vix: 24.64 },
  { date: '2022-07-11', sp500: 3860.43, nasdaq: 11360.05, dowjones: 31288.26, ftse100: 7258.32, hangSeng: 20697.36, nikkei: 26788.47, shanghai: 3228.08, vix: 24.23 },
  { date: '2022-07-18', sp500: 3961.63, nasdaq: 11834.11, dowjones: 31899.29, ftse100: 7250.86, hangSeng: 20609.21, nikkei: 27699.25, shanghai: 3270.38, vix: 22.5 },
  { date: '2022-07-25', sp500: 4130.29, nasdaq: 12390.69, dowjones: 32845.13, ftse100: 7423.43, hangSeng: 20156.51, nikkei: 27801.64, shanghai: 3253.24, vix: 21.33 },
  { date: '2022-08-01', sp500: 4145.19, nasdaq: 12957.79, dowjones: 32803.47, ftse100: 7440.21, hangSeng: 20174.04, nikkei: 28175.87, shanghai: 3186.27, vix: 21.15 },
  { date: '2022-08-08', sp500: 4280.15, nasdaq: 13352.78, dowjones: 33761.05, ftse100: 7500.89, hangSeng: 20175.62, nikkei: 28246.53, shanghai: 3277.79, vix: 19.53 },
  { date: '2022-08-15', sp500: 4228.48, nasdaq: 12705.21, dowjones: 33706.74, ftse100: 7550.37, hangSeng: 19832.33, nikkei: 28930.33, shanghai: 3258.08, vix: 19.53 },
  { date: '2022-08-22', sp500: 4057.66, nasdaq: 12141.71, dowjones: 31822.42, ftse100: 7428.27, hangSeng: 20170.04, nikkei: 28257.25, shanghai: 3235.59, vix: 24.32 },
  { date: '2022-08-29', sp500: 3924.26, nasdaq: 11630.86, dowjones: 31318.44, ftse100: 7284.15, hangSeng: 19865.87, nikkei: 27650.84, shanghai: 3186.48, vix: 24.75 },
  { date: '2022-09-05', sp500: 4067.36, nasdaq: 12112.31, dowjones: 32151.71, ftse100: 7367.7, hangSeng: 19122.62, nikkei: 28214.75, shanghai: 3242.72, vix: 23.79 },
  { date: '2022-09-12', sp500: 3873.33, nasdaq: 11535.24, dowjones: 30822.42, ftse100: 7295.68, hangSeng: 18930.38, nikkei: 27667.86, shanghai: 3226.44, vix: 26.3 },
]

const DEFAULT_SNAPSHOT: MarketSnapshot = {
  date: '1970-01-01',
  sp500: 1000,
  nasdaq: 1000,
  dowjones: 1000,
  ftse100: 1000,
  hangSeng: 1000,
  nikkei: 1000,
  shanghai: 1000,
  vix: 20,
}

const BASE_SNAPSHOT = MARKET_DATA[0] ?? DEFAULT_SNAPSHOT

const SNAPSHOT_MAP = new Map<string, MarketSnapshot>((MARKET_DATA.length ? MARKET_DATA : [BASE_SNAPSHOT]).map((entry) => [entry.date, entry]))

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const firstDate = BASE_SNAPSHOT.date

function toDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`)
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function previousWeek(dateStr: string) {
  const d = toDate(dateStr)
  d.setUTCDate(d.getUTCDate() - 7)
  return formatDate(d)
}

function weeksSinceStart(dateStr: string): number {
  return Math.round((toDate(dateStr).getTime() - toDate(firstDate).getTime()) / WEEK_MS)
}

function clampPositive(value: number) {
  return Number(Math.max(value, 1).toFixed(2))
}

function simulateSnapshot(dateStr: string, prevSnapshot: MarketSnapshot): MarketSnapshot {
  const offset = weeksSinceStart(dateStr)
  const base = 0.004 * Math.sin(offset / 2.5) + 0.003 * Math.cos(offset / 3.1)
  const jitter = 0.002 * Math.sin(offset / 1.7)

  const adjust = (value: number, factor: number) => Number((value * (1 + base * factor + jitter)).toFixed(2))

  return {
    date: dateStr,
    sp500: adjust(prevSnapshot.sp500, 1),
    nasdaq: adjust(prevSnapshot.nasdaq, 1.25),
    dowjones: adjust(prevSnapshot.dowjones, 0.85),
    ftse100: adjust(prevSnapshot.ftse100, 0.65),
    hangSeng: adjust(prevSnapshot.hangSeng, 1.4),
    nikkei: adjust(prevSnapshot.nikkei, 0.75),
    shanghai: adjust(prevSnapshot.shanghai, 0.55),
    vix: clampPositive(prevSnapshot.vix * (1 - (base * 1.4 + jitter))),
  }
}

export function getMarketSnapshot(dateStr: string): MarketSnapshot {
  if (toDate(dateStr).getTime() <= toDate(firstDate).getTime()) {
    return BASE_SNAPSHOT
  }
  const cached = SNAPSHOT_MAP.get(dateStr)
  if (cached) return cached
  const prevDate = previousWeek(dateStr)
  if (prevDate === dateStr) return BASE_SNAPSHOT
  const prevSnapshot = getMarketSnapshot(prevDate)
  const nextSnapshot = simulateSnapshot(dateStr, prevSnapshot)
  SNAPSHOT_MAP.set(dateStr, nextSnapshot)
  return nextSnapshot
}
