import { CommerceClient } from 'app/views/commerce/api/CommerceClient'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('CommerceClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('getCollections returns the items of the response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [{ id: 'col_1' }] }))

    await expect(CommerceClient.getCollections()).resolves.toEqual([{ id: 'col_1' }])

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/v1/collections')
  })

  it('createCollection posts the input as JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'col_9' }, 201))

    await CommerceClient.createCollection({ name: 'Poetry', description: 'Short and sweet' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ name: 'Poetry', description: 'Short and sweet' })
  })

  it('getBooks sends search and pagination as query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], total: 0 }))

    await CommerceClient.getBooks('col_1', { q: 'harbor', page: 2, limit: 10 })

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname).toBe('/api/v1/collections/col_1/books')
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: 'harbor', page: '2', limit: '10' })
  })

  it('getBooks resolves to undefined when the request is cancelled', async () => {
    fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'))

    await expect(CommerceClient.getBooks('col_1', { page: 1, limit: 10 })).resolves.toBeUndefined()
  })

  it('getBooks rethrows other errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'boom' }, 500))

    await expect(CommerceClient.getBooks('col_1', { page: 1, limit: 10 })).rejects.toMatchObject({
      name: 'ClientError',
    })
  })
})
