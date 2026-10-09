import { buildBook } from 'app/views/commerce/__fixtures__/buildBook'
import { booksToCsv } from './booksToCsv'

describe('booksToCsv', () => {
  it('writes a header and one row per book', () => {
    const csv = booksToCsv([buildBook({ title: 'A', author: 'B', priceCents: 1050, stock: 3 })])

    expect(csv).toBe('title,author,price,stock,archived\n"A","B",10.50,3,false')
  })

  it('escapes double quotes', () => {
    const csv = booksToCsv([buildBook({ title: 'The "Best" Book' })])

    expect(csv).toContain('"The ""Best"" Book"')
  })
})
