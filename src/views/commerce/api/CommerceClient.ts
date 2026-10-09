// Every endpoint used by the commerce view. It lives in the view because no other view imports it.
// Rule of thumb: used by 1 view -> views/<view>/api/, used by 2+ views -> global clients/.
// Components never call this: the store does.
import { Client } from 'app/clients/Client'
import type { Book, BooksPage, BooksQuery } from '../types/book'
import type { Collection, CreateCollectionInput } from '../types/collection'

export abstract class CommerceClient extends Client {
  static async getCollections(): Promise<Collection[]> {
    const { data } = await Client.get<{ items: Collection[] }>('/api/v1/collections')
    return data.items
  }

  static async getCollection(collectionId: string): Promise<Collection> {
    const { data } = await Client.get<Collection>(`/api/v1/collections/${collectionId}`)
    return data
  }

  static async createCollection(input: CreateCollectionInput): Promise<Collection> {
    const { data } = await Client.post<Collection>('/api/v1/collections', { data: input })
    return data
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    await Client.delete(`/api/v1/collections/${collectionId}`)
  }

  // Returns undefined when the request was cancelled by a newer one (see take-latest in the store).
  static async getBooks(
    collectionId: string,
    { q, page, limit }: BooksQuery,
    signal?: AbortSignal,
  ): Promise<BooksPage | undefined> {
    try {
      const { data } = await Client.get<BooksPage>(`/api/v1/collections/${collectionId}/books`, {
        params: { q, page, limit },
        signal,
      })
      return data
    } catch (error) {
      if (Client.isCancel(error)) return undefined
      throw error
    }
  }

  static async updateBook(bookId: string, patch: Partial<Pick<Book, 'archived'>>): Promise<Book> {
    const { data } = await Client.patch<Book>(`/api/v1/books/${bookId}`, { data: patch })
    return data
  }
}
