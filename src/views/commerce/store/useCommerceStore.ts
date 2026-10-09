// The ONE store of the commerce view. All API calls of the view start here:
//   screen -> store action -> CommerceClient -> (network)
// Global things (flash notifications) come from the global store, never from another view.

import { getErrorMessage } from 'app/utils/getErrorMessage'
import { reportToMonitoring } from 'app/utils/reportToMonitoring'
import { createTakeLatestSignal } from 'app/utils/takeLatestSignal'
import { FlashType } from 'app/zustand/flashStore'
import useStore from 'app/zustand/useStore'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CommerceClient } from '../api/CommerceClient'
import type { Book, BooksQuery } from '../types/book'
import type { Collection, CreateCollectionInput } from '../types/collection'

export interface CommerceState {
  collections: Record<string, Collection>
  loadingCollections: boolean
  collectionsError: string | null
  /** Error of the single collection opened by the Books screen (not of the list above). */
  collectionError: string | null
  selectedCollectionId: string | null

  books: Book[]
  booksTotal: number | null
  /** Which collection the books above belong to, so we never show another collection's rows. */
  booksCollectionId: string | null
  loadingBooks: boolean
  booksError: string | null

  fetchCollections: (options?: { silent?: boolean }) => Promise<void>
  fetchCollection: (collectionId: string) => Promise<void>
  createCollection: (input: CreateCollectionInput) => Promise<boolean>
  deleteCollection: (collectionId: string) => Promise<boolean>
  selectCollection: (collectionId: string | null) => void
  fetchBooks: (collectionId: string, query: BooksQuery) => Promise<void>
  setBookArchived: (bookId: string, archived: boolean) => Promise<boolean>
}

// One instance per fetch action, at module scope: each call aborts the previous request.
const nextBooksSignal = createTakeLatestSignal()

const flash = (type: FlashType, title: string, message: string) =>
  useStore.getState().addFlash({ type, title, message })

export const useCommerceStore = create<CommerceState>()(
  devtools(
    (set, get) => ({
      collections: {},
      loadingCollections: false,
      collectionsError: null,
      collectionError: null,
      selectedCollectionId: null,

      books: [],
      booksTotal: null,
      booksCollectionId: null,
      loadingBooks: false,
      booksError: null,

      // `silent` is used by polling: no spinner, and a failed refresh keeps what is on screen.
      fetchCollections: async ({ silent = false } = {}) => {
        if (!silent)
          set({ loadingCollections: true, collectionsError: null }, false, 'fetchCollections/start')
        try {
          const items = await CommerceClient.getCollections()
          set(
            {
              collections: Object.fromEntries(
                items.map((collection) => [collection.id, collection]),
              ),
              loadingCollections: false,
            },
            false,
            'fetchCollections/success',
          )
        } catch (error) {
          reportToMonitoring(error)
          if (!silent) {
            set(
              { loadingCollections: false, collectionsError: getErrorMessage(error) },
              false,
              'fetchCollections/error',
            )
          }
        }
      },

      fetchCollection: async (collectionId) => {
        set({ collectionError: null }, false, 'fetchCollection/start')
        try {
          const collection = await CommerceClient.getCollection(collectionId)
          set(
            (state) => ({ collections: { ...state.collections, [collection.id]: collection } }),
            false,
            'fetchCollection/success',
          )
        } catch (error) {
          reportToMonitoring(error)
          set({ collectionError: getErrorMessage(error) }, false, 'fetchCollection/error')
        }
      },

      createCollection: async (input) => {
        try {
          await CommerceClient.createCollection(input)
          flash(FlashType.Positive, 'Collection created', `"${input.name}" is syncing its books.`)
          await get().fetchCollections({ silent: true })
          return true
        } catch (error) {
          reportToMonitoring(error)
          flash(FlashType.Negative, 'Could not create the collection', getErrorMessage(error))
          return false
        }
      },

      deleteCollection: async (collectionId) => {
        try {
          await CommerceClient.deleteCollection(collectionId)
          flash(FlashType.Positive, 'Collection deleted', 'The collection was removed.')
          await get().fetchCollections({ silent: true })
          return true
        } catch (error) {
          reportToMonitoring(error)
          flash(FlashType.Negative, 'Could not delete the collection', getErrorMessage(error))
          return false
        }
      },

      selectCollection: (collectionId) =>
        set({ selectedCollectionId: collectionId }, false, 'selectCollection'),

      fetchBooks: async (collectionId, query) => {
        set(
          (state) => ({
            loadingBooks: true,
            booksError: null,
            booksCollectionId: collectionId,
            // Keep the rows while paginating or searching inside the same collection (no flicker),
            // but drop them when moving to another one, so its title never sits above stale rows.
            ...(state.booksCollectionId === collectionId ? {} : { books: [], booksTotal: null }),
          }),
          false,
          'fetchBooks/start',
        )
        const signal = nextBooksSignal()
        try {
          const response = await CommerceClient.getBooks(collectionId, query, signal)
          // Aborted by a newer request: it owns the loading state, so do not touch it.
          if (!response) return
          set(
            {
              books: response.items,
              booksTotal: response.total,
              loadingBooks: false,
              booksError: null,
            },
            false,
            'fetchBooks/success',
          )
        } catch (error) {
          reportToMonitoring(error)
          // Same guard on the failure path: without it a slow request that fails after a newer one
          // already succeeded would show an error on top of perfectly good results.
          if (signal.aborted) return
          set(
            { loadingBooks: false, booksError: getErrorMessage(error) },
            false,
            'fetchBooks/error',
          )
        }
      },

      setBookArchived: async (bookId, archived) => {
        try {
          const updated = await CommerceClient.updateBook(bookId, { archived })
          set(
            (state) => ({
              books: state.books.map((book) => (book.id === bookId ? updated : book)),
            }),
            false,
            'setBookArchived/success',
          )
          flash(FlashType.Positive, archived ? 'Book archived' : 'Book restored', updated.title)
          return true
        } catch (error) {
          reportToMonitoring(error)
          flash(FlashType.Negative, 'Could not update the book', getErrorMessage(error))
          return false
        }
      },
    }),
    { name: 'Commerce store', enabled: import.meta.env.DEV },
  ),
)
