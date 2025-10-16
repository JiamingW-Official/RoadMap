import { expectType } from 'tsd'
import type { LatLngTuple, Firm } from '../src/types/firm'

const p: LatLngTuple = [40.758, -73.9855]
expectType<readonly [number, number]>(p)

// @ts-expect-error - string[] should not be assignable to LatLngTuple
const badPos1: LatLngTuple = ['40.758', '-73.9855'] as unknown as any

// @ts-expect-error - any[] should not be assignable
const badPos2: LatLngTuple = [40.758] as unknown as any

const firm: Firm = {
  id: 1,
  category: 'VC',
  firm_name: 'Demo',
  hq_address: 'Addr',
  city: 'NYC',
  state: 'NY',
  difficulty_level: 3,
  cost_level: 2,
  round_stage: 'Seed',
  position: p,
}

expectType<LatLngTuple | undefined>(firm.position)
