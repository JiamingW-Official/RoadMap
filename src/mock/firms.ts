import { type Firm } from '../types/firm'

export const MOCK_FIRMS: Firm[] = [
  { id: 1, category: 'Angel', firm_name: 'Golden Seed Partners', hq_address: '123 5th Ave', city: 'New York', state: 'NY', difficulty_level: 2, cost_level: 2, round_stage: 'Pre-Seed', website: 'https://example.com', position: [40.7615, -73.9777], __source: 'base' },
  { id: 2, category: 'VC', firm_name: 'Hudson Ventures', hq_address: '200 Broadway', city: 'New York', state: 'NY', difficulty_level: 3, cost_level: 3, round_stage: 'Seed', website: 'https://example.com', __source: 'base' },
  { id: 3, category: 'PE', firm_name: 'Empire Capital', hq_address: '350 Park Ave', city: 'New York', state: 'NY', difficulty_level: 4, cost_level: 4, round_stage: 'Series A', website: 'https://example.com', position: [40.757, -73.978], __source: 'base' },
  { id: 4, category: 'Investment Bank', firm_name: 'Liberty Securities', hq_address: '11 Wall St', city: 'New York', state: 'NY', difficulty_level: 5, cost_level: 5, round_stage: 'IPO', website: 'https://example.com', __source: 'base' },
  { id: 5, category: 'Asset Manager', firm_name: 'Atlas Asset Mgmt', hq_address: '1 Bryant Park', city: 'New York', state: 'NY', difficulty_level: 3, cost_level: 4, round_stage: 'Series B', website: 'https://example.com', position: [40.755, -73.986], __source: 'base' },
  { id: 6, category: 'VC', firm_name: 'Harbor Bridge Capital', hq_address: '4 World Trade Center', city: 'New York', state: 'NY', difficulty_level: 4, cost_level: 4, round_stage: 'Series C', website: 'https://example.com', __source: 'base' },
  { id: 7, category: 'Angel', firm_name: 'SoHo Angels', hq_address: 'Prince St', city: 'New York', state: 'NY', difficulty_level: 2, cost_level: 2, round_stage: 'Seed', website: 'https://example.com', __source: 'base' },
  { id: 8, category: 'Investment Bank', firm_name: 'Manhattan Prime', hq_address: 'Broad St', city: 'New York', state: 'NY', difficulty_level: 5, cost_level: 5, round_stage: 'IPO', website: 'https://example.com', position: [40.706, -74.009], __source: 'base' },
  { id: 9, category: 'PE', firm_name: 'Tribeca Holdings', hq_address: 'Greenwich St', city: 'New York', state: 'NY', difficulty_level: 4, cost_level: 3, round_stage: 'Series B', website: 'https://example.com', __source: 'base' },
  { id: 10, category: 'Asset Manager', firm_name: 'Crown Wealth', hq_address: 'Madison Ave', city: 'New York', state: 'NY', difficulty_level: 3, cost_level: 2, round_stage: 'Post-IPO', website: 'https://example.com', position: [40.773, -73.964], __source: 'base' },
]
