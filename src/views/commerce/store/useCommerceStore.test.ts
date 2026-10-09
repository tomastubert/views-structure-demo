import { buildBook } from 'app/views/commerce/__fixtures__/buildBook'
import { buildCollection } from 'app/views/commerce/__fixtures__/buildCollection'
import { CommerceClient } from 'app/views/commerce/api/CommerceClient'
import { useCommerceStore } from 'app/views/commerce/store/useCommerceStore'
import useStore from 'app/zustand/useStore'

vi.mock('app/views/commerce/api/CommerceClient')
vi.mock('app/utils/reportToMonitoring', () => ({ reportToMonitoring: vi.fn() }))

const initialState = useCommerceStore.getState()
const initialGlobalState = useStore.getState()

const flashes = () => Object.values(useStore.getState().flashes)

describe('useCommerceStore', () => {
  afterEach(() => {
    useCommerceStore.setState(initialState)
    useStore.setState(initialGlobalState)
  })

  describe('fetchCollections', () => {
    it('stores the collections by id', async () => {
      vi.mocked(CommerceClient.getCollections).mockResolvedValue([
        buildCollection({ id: 'col_1' }),
        buildCollection({ id: 'col_2' }),
      ])

      await useCommerceStore.getState().fetchCollections()

      const { collections, loadingCollections } = useCommerceStore.getState()
      expect(Object.keys(collections)).toEqual(['col_1', 'col_2'])
      expect(loadingCollections).toBe(false)
    })

    it('stores the error message when it fails', async () => {
      vi.mocked(CommerceClient.getCollections).mockRejectedValue(new Error('boom'))

      await useCommerceStore.getState().fetchCollections()

      expect(useCommerceStore.getState().collectionsError).toBe('boom')
    })

    it('keeps the current data when a silent refresh fails', async () => {
      useCommerceStore.setState({ collections: { col_1: buildCollection({ id: 'col_1' }) } })
      vi.mocked(CommerceClient.getCollections).mockRejectedValue(new Error('boom'))

      await useCommerceStore.getState().fetchCollections({ silent: true })

      expect(useCommerceStore.getState().collectionsError).toBeNull()
      expect(Object.keys(useCommerceStore.getState().collections)).toEqual(['col_1'])
    })
  })

  describe('createCollection', () => {
    it('creates, refreshes the list and shows a positive flash', async () => {
      vi.mocked(CommerceClient.createCollection).mockResolvedValue(buildCollection())
      vi.mocked(CommerceClient.getCollections).mockResolvedValue([buildCollection()])

      const created = await useCommerceStore
        .getState()
        .createCollection({ name: 'Poetry', description: '' })

      expect(created).toBe(true)
      expect(CommerceClient.getCollections).toHaveBeenCalledTimes(1)
      expect(flashes()[0]).toMatchObject({ type: 'positive', title: 'Collection created' })
    })

    it('returns false and shows a negative flash when it fails', async () => {
      vi.mocked(CommerceClient.createCollection).mockRejectedValue(new Error('no permission'))

      const created = await useCommerceStore
        .getState()
        .createCollection({ name: 'Poetry', description: '' })

      expect(created).toBe(false)
      expect(flashes()[0]).toMatchObject({ type: 'negative', message: 'no permission' })
    })
  })

  describe('fetchBooks', () => {
    it('stores the page of books', async () => {
      vi.mocked(CommerceClient.getBooks).mockResolvedValue({ items: [buildBook()], total: 31 })

      await useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      const { books, booksTotal, loadingBooks } = useCommerceStore.getState()
      expect(books).toHaveLength(1)
      expect(booksTotal).toBe(31)
      expect(loadingBooks).toBe(false)
    })

    it('does not touch the loading state when the request was cancelled', async () => {
      vi.mocked(CommerceClient.getBooks).mockResolvedValue(undefined)

      await useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      // A newer request owns the loading flag, so it must stay on.
      expect(useCommerceStore.getState().loadingBooks).toBe(true)
    })

    it('drops the previous collection rows when another collection is opened', async () => {
      vi.mocked(CommerceClient.getBooks).mockResolvedValue({ items: [buildBook()], total: 1 })
      await useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      // Never resolves: we want to look at the state while the new request is in flight.
      vi.mocked(CommerceClient.getBooks).mockReturnValue(new Promise(() => {}))
      useCommerceStore.getState().fetchBooks('col_2', { page: 1, limit: 10 })

      expect(useCommerceStore.getState().books).toEqual([])
      expect(useCommerceStore.getState().booksTotal).toBeNull()
    })

    it('keeps the rows while paginating inside the same collection', async () => {
      vi.mocked(CommerceClient.getBooks).mockResolvedValue({ items: [buildBook()], total: 31 })
      await useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      vi.mocked(CommerceClient.getBooks).mockReturnValue(new Promise(() => {}))
      useCommerceStore.getState().fetchBooks('col_1', { page: 2, limit: 10 })

      // No flicker: the table shows the current page until the next one arrives.
      expect(useCommerceStore.getState().books).toHaveLength(1)
      expect(useCommerceStore.getState().booksTotal).toBe(31)
    })

    it('aborts the in-flight request when a newer one starts', async () => {
      const signals: (AbortSignal | undefined)[] = []
      vi.mocked(CommerceClient.getBooks).mockImplementation((_collectionId, _query, signal) => {
        signals.push(signal)
        return new Promise(() => {}) // never settles: both requests stay in flight
      })

      useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })
      useCommerceStore.getState().fetchBooks('col_1', { q: 'harbor', page: 1, limit: 10 })

      // This is what take-latest buys us: the stale search is cancelled, the newest one survives.
      expect(signals[0]?.aborted).toBe(true)
      expect(signals[1]?.aborted).toBe(false)
    })

    it('does not show an error when a stale request fails after a newer one succeeded', async () => {
      let failStale: (error: Error) => void = () => {}
      vi.mocked(CommerceClient.getBooks).mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          failStale = reject
        }),
      )
      const stale = useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      vi.mocked(CommerceClient.getBooks).mockResolvedValueOnce({ items: [buildBook()], total: 1 })
      await useCommerceStore.getState().fetchBooks('col_1', { q: 'harbor', page: 1, limit: 10 })

      failStale(new Error('boom'))
      await stale

      expect(useCommerceStore.getState().booksError).toBeNull()
      expect(useCommerceStore.getState().books).toHaveLength(1)
    })

    it('clears a previous error once a request succeeds', async () => {
      useCommerceStore.setState({ booksError: 'boom' })
      vi.mocked(CommerceClient.getBooks).mockResolvedValue({ items: [], total: 0 })

      await useCommerceStore.getState().fetchBooks('col_1', { page: 1, limit: 10 })

      expect(useCommerceStore.getState().booksError).toBeNull()
    })
  })

  describe('setBookArchived', () => {
    it('replaces the book with the updated one', async () => {
      useCommerceStore.setState({
        books: [buildBook({ id: 'book_1' }), buildBook({ id: 'book_2' })],
      })
      vi.mocked(CommerceClient.updateBook).mockResolvedValue(
        buildBook({ id: 'book_2', archived: true }),
      )

      const updated = await useCommerceStore.getState().setBookArchived('book_2', true)

      expect(updated).toBe(true)
      expect(useCommerceStore.getState().books.map((book) => book.archived)).toEqual([false, true])
    })
  })
})
