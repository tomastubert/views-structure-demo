// Initial data of the mock server. Everything here is invented.
import type { Book } from '../types/book'
import type { Collection } from '../types/collection'
import { buildBook } from './buildBook'
import { buildCollection } from './buildCollection'

const ADJECTIVES = [
  'Quiet',
  'Golden',
  'Hidden',
  'Paper',
  'Northern',
  'Last',
  'Silver',
  'Wandering',
  'Hollow',
  'Bright',
]
const NOUNS = [
  'Harbor',
  'Orchard',
  'Library',
  'Compass',
  'Lantern',
  'Garden',
  'River',
  'Atlas',
  'Bridge',
  'Season',
]
const AUTHORS = [
  'Mira Ostrander',
  'Tomas Lindqvist',
  'Ines Calloway',
  'Jonah Pembroke',
  'Priya Anand',
  'Felix Marchetti',
]

// Builds `count` books, numbered from `offset`. Pure and deterministic: the same offset always
// produces the same books, and the adjective/noun pair is unique for the first 100 of them.
const makeBooks = (collectionId: string, count: number, offset: number): Book[] =>
  Array.from({ length: count }, (_, index) => {
    const n = offset + index
    return buildBook({
      id: `book_${n + 1}`,
      collectionId,
      title: `The ${ADJECTIVES[n % ADJECTIVES.length]} ${NOUNS[Math.floor(n / ADJECTIVES.length) % NOUNS.length]}`,
      author: AUTHORS[n % AUTHORS.length],
      priceCents: 899 + ((n * 137) % 2200),
      stock: (n * 7) % 23,
      archived: n % 9 === 8,
    })
  })

export const seedCollections: Collection[] = [
  buildCollection({
    id: 'col_1',
    name: 'Weekend Reads',
    description: 'Easy picks for a slow Saturday.',
  }),
  buildCollection({
    id: 'col_2',
    name: 'Classics Corner',
    description: 'Long-loved stories for a rainy afternoon.',
  }),
  buildCollection({
    id: 'col_3',
    name: 'New Arrivals',
    description: 'Fresh on the shelves. Still syncing.',
    status: 'syncing',
  }),
  buildCollection({ id: 'col_4', name: 'Staff Picks', description: 'Nothing here yet.' }),
]

export const seedBooks: Book[] = [
  ...makeBooks('col_1', 14, 0),
  ...makeBooks('col_2', 25, 14),
  ...makeBooks('col_3', 6, 39),
]
