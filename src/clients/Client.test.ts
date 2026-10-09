import {
  BadRequestError,
  Client,
  ClientError,
  ForbiddenError,
  ResourceNotFoundError,
  ResourceValidationError,
} from 'app/clients/Client'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('Client', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns data and status for successful requests', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

    const response = await Client.get<{ ok: boolean }>('/api/v1/ping')

    expect(response.data).toEqual({ ok: true })
    expect(response.status).toBe(200)
  })

  it('sends the bound user header', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    Client.bindToUser('user-editor')

    await Client.get('/api/v1/ping')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['x-demo-user']).toBe('user-editor')
    Client.bindToUser(null)
  })

  it.each([
    [400, BadRequestError],
    [403, ForbiddenError],
    [404, ResourceNotFoundError],
    [422, ResourceValidationError],
    [500, ClientError],
  ])('maps status %i to a typed error', async (status, ErrorClass) => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'nope' }, status))

    const promise = Client.get('/api/v1/ping')

    await expect(promise).rejects.toBeInstanceOf(ErrorClass)
    await expect(promise).rejects.toMatchObject({ response: { status, data: { message: 'nope' } } })
  })

  it('rethrows cancelled requests untouched', async () => {
    fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'))

    const promise = Client.get('/api/v1/ping')

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    await promise.catch((error) => expect(Client.isCancel(error)).toBe(true))
  })
})
