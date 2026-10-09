import type { Book } from '../types/book'

export const buildBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'book_1',
  collectionId: 'col_1',
  title: 'The Quiet Harbor',
  author: 'Mira Ostrander',
  priceCents: 1599,
  stock: 12,
  archived: false,
  ...overrides,
})
