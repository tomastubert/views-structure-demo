// Mirage routes of the commerce view. The view owns its interceptor and its fixtures;
// mocks/startMockServer.ts only composes them. State is in memory and resets on reload.

import {
  errorResponse,
  forbiddenResponse,
  jsonResponse,
  parseBody,
  withDevBehaviour,
} from 'app/mocks/helpers'
import type { Server } from 'miragejs'
import { seedBooks, seedCollections } from '../__fixtures__/commerceSeed'
import type { Book } from '../types/book'
import type { Collection, CreateCollectionInput } from '../types/collection'

// A syncing collection becomes ready after this many list requests (so polling is visible).
const POLLS_UNTIL_READY = 3

export const registerCommerceMocks = (server: Server) => {
  const collections: Collection[] = seedCollections.map((collection) => ({ ...collection }))
  const books: Book[] = seedBooks.map((book) => ({ ...book }))
  const polls = new Map<string, number>()
  let nextCollectionId = collections.length + 1

  const withBookCount = (collection: Collection): Collection => ({
    ...collection,
    bookCount: books.filter((book) => book.collectionId === collection.id).length,
  })

  server.get(
    '/collections',
    withDevBehaviour((request) => {
      const forbidden = forbiddenResponse(request, 'collection:read')
      if (forbidden) return forbidden

      for (const collection of collections) {
        if (collection.status !== 'syncing') continue
        const count = (polls.get(collection.id) ?? 0) + 1
        polls.set(collection.id, count)
        if (count >= POLLS_UNTIL_READY) collection.status = 'ready'
      }
      return { items: collections.map(withBookCount) }
    }),
  )

  server.post(
    '/collections',
    withDevBehaviour((request) => {
      const forbidden = forbiddenResponse(request, 'collection:create')
      if (forbidden) return forbidden

      const { name, description } = parseBody<CreateCollectionInput>(request)
      if (!name?.trim()) return errorResponse(422, 'A collection needs a name.')

      const collection: Collection = {
        id: `col_${nextCollectionId++}`,
        name: name.trim(),
        description: description?.trim() ?? '',
        status: 'syncing',
        bookCount: 0,
      }
      collections.push(collection)
      return jsonResponse(201, withBookCount(collection))
    }),
  )

  server.get(
    '/collections/:id',
    withDevBehaviour((request) => {
      const collection = collections.find((item) => item.id === request.params.id)
      return collection ? withBookCount(collection) : errorResponse(404, 'Collection not found.')
    }),
  )

  server.delete(
    '/collections/:id',
    withDevBehaviour((request) => {
      const forbidden = forbiddenResponse(request, 'collection:delete')
      if (forbidden) return forbidden

      const index = collections.findIndex((item) => item.id === request.params.id)
      if (index === -1) return errorResponse(404, 'Collection not found.')

      const [removed] = collections.splice(index, 1)
      for (let i = books.length - 1; i >= 0; i--) {
        if (books[i].collectionId === removed.id) books.splice(i, 1)
      }
      return jsonResponse(204)
    }),
  )

  server.get(
    '/collections/:id/books',
    withDevBehaviour((request) => {
      const forbidden = forbiddenResponse(request, 'book:read')
      if (forbidden) return forbidden

      if (!collections.some((item) => item.id === request.params.id)) {
        return errorResponse(404, 'Collection not found.')
      }

      // Mirage gives string | string[] | null: `?q=a&q=b` is a real possibility from a crafted URL.
      const first = (value: string | string[] | null | undefined) =>
        Array.isArray(value) ? value[0] : (value ?? undefined)
      const { q, page, limit } = request.queryParams
      const term = first(q)?.trim().toLowerCase()
      const pageSize = Math.min(Math.max(Number(first(limit)) || 10, 1), 50)
      const pageNumber = Math.max(Number(first(page)) || 1, 1)

      const matches = books
        .filter((book) => book.collectionId === request.params.id)
        .filter((book) => !term || `${book.title} ${book.author}`.toLowerCase().includes(term))
        .sort((a, b) => a.title.localeCompare(b.title))

      return {
        items: matches.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
        total: matches.length,
      }
    }),
  )

  server.patch(
    '/books/:id',
    withDevBehaviour((request) => {
      const forbidden = forbiddenResponse(request, 'book:edit')
      if (forbidden) return forbidden

      const book = books.find((item) => item.id === request.params.id)
      if (!book) return errorResponse(404, 'Book not found.')

      Object.assign(book, parseBody<Partial<Pick<Book, 'archived'>>>(request))
      return { ...book }
    }),
  )
}
