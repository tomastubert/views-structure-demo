import type { Book } from '../../../types/book'

// A cell starting with = + - or @ is run as a formula by spreadsheet apps, so it gets a quote prefix.
const escapeCell = (value: string) => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replaceAll('"', '""')}"`
}

// Pure function (easy to test); the screen is in charge of triggering the download.
export const booksToCsv = (books: Book[]) =>
  [
    'title,author,price,stock,archived',
    ...books.map((book) =>
      [
        escapeCell(book.title),
        escapeCell(book.author),
        (book.priceCents / 100).toFixed(2),
        book.stock,
        book.archived,
      ].join(','),
    ),
  ].join('\n')
