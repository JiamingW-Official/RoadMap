import { z } from 'zod'

export const LatLngTupleZ = z.tuple([z.number(), z.number()])

export const FirmZ = z.object({
  id: z.number(),
  category: z.enum(["Angel", "VC", "PE", "Investment Bank", "Asset Manager"]),
  firm_name: z.string(),
  hq_address: z.string(),
  city: z.string(),
  state: z.string(),
  difficulty_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  cost_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  required_capital_usd: z.string().optional(),
  round_stage: z.enum(["Pre-Seed","Seed","Series A","Series B","Series C","IPO","Post-IPO"]).optional(),
  website: z.string().url().optional(),
  sector_focus: z.string().optional(),
  valuation_increase_rate: z.number().optional(),
  equity_dilution_rate: z.number().optional(),
  reputation_effect: z.number().optional(),
  growth_speed_effect: z.number().optional(),
  position: LatLngTupleZ.optional(),
  __source: z.enum(["base","json","csv","merged"]).optional(),
})

export type FirmInput = z.infer<typeof FirmZ>

export const EconomyZ = z.object({
  round_multipliers: z.record(z.string(), z.number()).default({}),
  dilution_ranges: z.record(z.string(), z.tuple([z.number(), z.number()])).default({}),
})

export type Economy = z.infer<typeof EconomyZ>
