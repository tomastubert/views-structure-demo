// Only used by the Books screen. Purely presentational: data and callbacks come in as props.
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import type { Book } from '../../../../types/book'
import { ROWS_PER_PAGE_OPTIONS } from '../../hooks/useBooksQuery'
import { formatPrice } from '../../utils/formatPrice'

interface BooksTableProps {
  books: Book[]
  total: number
  page: number
  limit: number
  loading: boolean
  canEdit: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onToggleArchived: (book: Book) => void
}

const stockChip = (stock: number) => {
  if (stock === 0) return <Chip size="small" color="error" label="Out of stock" />
  if (stock < 5) return <Chip size="small" color="warning" label={`Low (${stock})`} />
  return <>{stock}</>
}

export default function BooksTable(props: BooksTableProps) {
  const {
    books,
    total,
    page,
    limit,
    loading,
    canEdit,
    onPageChange,
    onLimitChange,
    onToggleArchived,
  } = props

  return (
    <Paper variant="outlined">
      {loading && <LinearProgress aria-label="Loading books" />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id} data-testid={`book-row-${book.id}`}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell align="right">{formatPrice(book.priceCents)}</TableCell>
                <TableCell align="right">{stockChip(book.stock)}</TableCell>
                <TableCell>
                  {book.archived ? <Chip size="small" label="Archived" /> : 'Active'}
                </TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <Button size="small" onClick={() => onToggleArchived(book)}>
                      {book.archived ? 'Restore' : 'Archive'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {books.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 4 }}>
                  No books match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
        onRowsPerPageChange={(event) => onLimitChange(Number(event.target.value))}
      />
    </Paper>
  )
}
