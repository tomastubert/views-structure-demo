// Search and pagination live in the URL (?q=&page=&limit=): links can be shared and survive a reload.
// Typing is debounced so the URL (and the request) only change when the user pauses.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { BooksQuery } from '../../../types/book'

const SEARCH_DEBOUNCE_MS = 300

// The table and the URL must agree on the allowed page sizes, so both read this.
export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25]
const DEFAULT_LIMIT = 10

// The URL is user input: a hand-edited or stale link must not break the screen.
const readLimit = (raw: string | null) => {
  const limit = Number(raw)
  return ROWS_PER_PAGE_OPTIONS.includes(limit) ? limit : DEFAULT_LIMIT
}

export const useBooksQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = readLimit(searchParams.get('limit'))
  const [searchInput, setSearchInput] = useState(q)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // The last search term WE wrote to the URL, so we can tell our own writes from external ones.
  const writtenSearch = useRef(q)

  // Keep the input in sync when the URL changes from the outside (browser back/forward, a link).
  // Our own debounced writes are skipped: the user may have typed more since the timer fired, and
  // overwriting the field with a stale prefix would eat those keystrokes.
  useEffect(() => {
    if (q === writtenSearch.current) return
    writtenSearch.current = q
    setSearchInput(q)
  }, [q])

  const query = useMemo<BooksQuery>(() => ({ q: q || undefined, page, limit }), [q, page, limit])

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      // Any explicit change wins over a search the user typed but has not paused on yet,
      // otherwise the pending timer would fire later and undo it (e.g. reset the page to 1).
      clearTimeout(timer.current)
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setSearch = (value: string) => {
    setSearchInput(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      writtenSearch.current = value
      // A new search always starts from the first page.
      updateParams({ q: value || undefined, page: undefined })
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return {
    query,
    searchInput,
    setSearch,
    setPage: (nextPage: number) =>
      updateParams({ page: nextPage > 1 ? String(nextPage) : undefined }),
    setLimit: (nextLimit: number) => updateParams({ limit: String(nextLimit), page: undefined }),
  }
}
