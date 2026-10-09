import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { useBooksQuery } from './useBooksQuery'

const wrapper =
  (initialEntry: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  )

// Renders the hook together with the current location, so we can assert on the URL it writes.
const renderBooksQuery = (initialEntry = '/collections/col_1') =>
  renderHook(
    () => ({ ...useBooksQuery(), search: useLocation().search, navigate: useNavigate() }),
    { wrapper: wrapper(initialEntry) },
  )

describe('useBooksQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('defaults to the first page when the URL has no params', () => {
    const { result } = renderBooksQuery()

    expect(result.current.query).toEqual({ q: undefined, page: 1, limit: 10 })
  })

  it('reads search and pagination from the URL', () => {
    const { result } = renderBooksQuery('/collections/col_1?q=harbor&page=3&limit=25')

    expect(result.current.query).toEqual({ q: 'harbor', page: 3, limit: 25 })
    expect(result.current.searchInput).toBe('harbor')
  })

  it('falls back to page 1 for invalid values', () => {
    const { result } = renderBooksQuery('/collections/col_1?page=-2&limit=abc')

    expect(result.current.query).toEqual({ q: undefined, page: 1, limit: 10 })
  })

  it('debounces typing: the URL only changes once the user pauses', () => {
    const { result } = renderBooksQuery()

    act(() => result.current.setSearch('har'))
    act(() => result.current.setSearch('harbor'))

    // Typed text is shown immediately, but the query (and so the request) has not changed yet.
    expect(result.current.searchInput).toBe('harbor')
    expect(result.current.query.q).toBeUndefined()

    act(() => vi.advanceTimersByTime(300))

    expect(result.current.query.q).toBe('harbor')
    expect(result.current.search).toContain('q=harbor')
  })

  it('keeps the query object identity stable across renders', () => {
    const { result, rerender } = renderBooksQuery()
    const first = result.current.query

    rerender()

    // Books.tsx has this object in a useEffect dependency list: a new identity would refetch forever.
    expect(result.current.query).toBe(first)
  })

  it('goes back to the first page when the search changes', () => {
    const { result } = renderBooksQuery('/collections/col_1?page=4')

    act(() => result.current.setSearch('harbor'))
    act(() => vi.advanceTimersByTime(300))

    expect(result.current.query.page).toBe(1)
  })

  it('keeps typing when the debounce fires mid-word', () => {
    const { result } = renderBooksQuery()

    // Slow typist: the timer fires on "qui" before the rest is typed. The guard that makes this
    // safe (writtenSearch) only shows its value under real browser timing; see the browser check
    // in the README. This test pins the expected behaviour.
    act(() => result.current.setSearch('qui'))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current.query.q).toBe('qui')

    act(() => result.current.setSearch('quiet'))
    // Our own URL write must not reset the field to the stale prefix.
    expect(result.current.searchInput).toBe('quiet')

    act(() => vi.advanceTimersByTime(300))
    expect(result.current.searchInput).toBe('quiet')
    expect(result.current.query.q).toBe('quiet')
  })

  it('syncs the input when the URL changes from the outside (browser back)', () => {
    const { result } = renderBooksQuery('/collections/col_1?q=harbor')
    expect(result.current.searchInput).toBe('harbor')

    // Navigating without going through setSearch is what the Back button does.
    act(() => result.current.navigate('/collections/col_1?q=orchard'))

    expect(result.current.searchInput).toBe('orchard')
    expect(result.current.query.q).toBe('orchard')
  })

  it('keeps page 1 out of the URL and writes the rest', () => {
    const { result } = renderBooksQuery()

    act(() => result.current.setPage(3))
    expect(result.current.search).toContain('page=3')

    act(() => result.current.setPage(1))
    expect(result.current.search).not.toContain('page=')

    act(() => result.current.setLimit(25))
    expect(result.current.search).toContain('limit=25')
  })
})
