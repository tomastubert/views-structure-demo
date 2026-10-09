import type { Collection } from '../types/collection'

// Factory with overrides: the pattern used for every fixture.
export const buildCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'col_1',
  name: 'Weekend Reads',
  description: 'Easy picks for a slow Saturday.',
  status: 'ready',
  bookCount: 0,
  ...overrides,
})
