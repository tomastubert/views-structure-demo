import { act, cleanup, renderHook } from '@testing-library/react'
import { buildCollection } from 'app/views/commerce/__fixtures__/buildCollection'
import { useCommerceStore } from 'app/views/commerce/store/useCommerceStore'
import { useCollectionsPolling } from './useCollectionsPolling'

const initialState = useCommerceStore.getState()

const setCollections = (...collections: ReturnType<typeof buildCollection>[]) =>
  useCommerceStore.setState({
    collections: Object.fromEntries(collections.map((collection) => [collection.id, collection])),
  })

describe('useCollectionsPolling', () => {
  let fetchCollections: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    fetchCollections = vi.fn()
    useCommerceStore.setState({ fetchCollections })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    useCommerceStore.setState(initialState)
  })

  it('does not poll when every collection is ready', () => {
    setCollections(buildCollection({ id: 'col_1', status: 'ready' }))

    renderHook(() => useCollectionsPolling())
    act(() => vi.advanceTimersByTime(10_000))

    expect(fetchCollections).not.toHaveBeenCalled()
  })

  it('refreshes silently while a collection is syncing', () => {
    setCollections(buildCollection({ id: 'col_1', status: 'syncing' }))

    renderHook(() => useCollectionsPolling())
    act(() => vi.advanceTimersByTime(3000))

    // Silent, so the list does not flash a spinner on every tick.
    expect(fetchCollections).toHaveBeenCalledWith({ silent: true })

    act(() => vi.advanceTimersByTime(6000))
    expect(fetchCollections).toHaveBeenCalledTimes(3)
  })

  it('stops polling once nothing is syncing any more', () => {
    setCollections(buildCollection({ id: 'col_1', status: 'syncing' }))
    renderHook(() => useCollectionsPolling())

    act(() => vi.advanceTimersByTime(3000))
    expect(fetchCollections).toHaveBeenCalledTimes(1)

    act(() => setCollections(buildCollection({ id: 'col_1', status: 'ready' })))
    act(() => vi.advanceTimersByTime(30_000))

    expect(fetchCollections).toHaveBeenCalledTimes(1)
  })

  it('clears the interval when the screen unmounts', () => {
    setCollections(buildCollection({ id: 'col_1', status: 'syncing' }))
    const { unmount } = renderHook(() => useCollectionsPolling())

    unmount()
    act(() => vi.advanceTimersByTime(30_000))

    expect(fetchCollections).not.toHaveBeenCalled()
  })
})
