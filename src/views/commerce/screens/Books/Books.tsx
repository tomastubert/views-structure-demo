// Screen: /commerce/collections/:collectionId
// Reads from the view store and calls store actions. It never talks to the API directly.
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmptyState from 'app/components/EmptyState/EmptyState'
import { usePermission } from 'app/hooks/usePermission'
import { useFeatureFlag } from 'app/zustand/useFeatureFlags'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useShallow } from 'zustand/shallow'
import { useCommerceStore } from '../../store/useCommerceStore'
import BooksTable from './components/BooksTable/BooksTable'
import { useBooksQuery } from './hooks/useBooksQuery'
import { booksToCsv } from './utils/booksToCsv'

const downloadCsv = (csv: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  // The anchor has to be in the document for the click to work in every browser,
  // and the URL can only be revoked once the download has started.
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function Books() {
  const { collectionId = '' } = useParams<{ collectionId: string }>()
  const { query, searchInput, setSearch, setPage, setLimit } = useBooksQuery()
  const { collection, books, total, loading, error, fetchBooks, setBookArchived } =
    useCommerceStore(
      useShallow((state) => ({
        collection: state.collections[collectionId],
        books: state.books,
        total: state.booksTotal,
        loading: state.loadingBooks,
        error: state.booksError,
        fetchBooks: state.fetchBooks,
        setBookArchived: state.setBookArchived,
      })),
    )
  const canEdit = usePermission('book:edit')
  const canExport = useFeatureFlag('exportCsv')

  // Mark this collection as the selected one (the header shows its name) and load it if needed.
  useEffect(() => {
    const { selectCollection, collections, fetchCollection } = useCommerceStore.getState()
    selectCollection(collectionId)
    if (!collections[collectionId]) fetchCollection(collectionId)
    return () => useCommerceStore.getState().selectCollection(null)
  }, [collectionId])

  useEffect(() => {
    fetchBooks(collectionId, query)
  }, [collectionId, query, fetchBooks])

  if (error && books.length === 0) {
    return (
      <EmptyState
        title="We could not load the books"
        description={error}
        actionLabel="Retry"
        onAction={() => fetchBooks(collectionId, query)}
      />
    )
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Typography component="h1" variant="h4">
          {collection?.name ?? 'Collection'}
        </Typography>
        {collection?.status === 'syncing' && <Chip size="small" color="warning" label="Syncing…" />}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <TextField
          size="small"
          label="Search books"
          value={searchInput}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: 320 }}
        />
        {canExport && (
          <Button variant="outlined" onClick={() => downloadCsv(booksToCsv(books), 'books.csv')}>
            Export this page (CSV)
          </Button>
        )}
      </Stack>

      {/* A refresh that fails while rows are on screen must not fail silently. */}
      {error && books.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button size="small" onClick={() => fetchBooks(collectionId, query)}>
              Retry
            </Button>
          }
        >
          We could not refresh this list. You are seeing the previous results.
        </Alert>
      )}

      <BooksTable
        books={books}
        total={total ?? 0}
        page={query.page}
        limit={query.limit}
        loading={loading}
        canEdit={canEdit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onToggleArchived={(book) => setBookArchived(book.id, !book.archived)}
      />
    </Stack>
  )
}
