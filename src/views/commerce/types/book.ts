export interface Book {
  id: string
  collectionId: string
  title: string
  author: string
  priceCents: number
  stock: number
  archived: boolean
}

export interface BooksQuery {
  q?: string
  page: number
  limit: number
}

export interface BooksPage {
  items: Book[]
  total: number
}
