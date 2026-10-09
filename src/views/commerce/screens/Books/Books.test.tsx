import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildUser } from 'app/mocks/session/__fixtures__/buildUser'
import { buildBook } from 'app/views/commerce/__fixtures__/buildBook'
import { buildCollection } from 'app/views/commerce/__fixtures__/buildCollection'
import { CommerceClient } from 'app/views/commerce/api/CommerceClient'
import { useCommerceStore } from 'app/views/commerce/store/useCommerceStore'
import useStore from 'app/zustand/useStore'
import { MemoryRouter, Route, Routes } from 'react-router'
import Books from './Books'

vi.mock('app/views/commerce/api/CommerceClient')
vi.mock('app/utils/reportToMonitoring', () => ({ reportToMonitoring: vi.fn() }))

const initialState = useCommerceStore.getState()
const initialGlobalState = useStore.getState()

const renderScreen = async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/collections/col_1']}>
        <Routes>
          <Route path="/collections/:collectionId" element={<Books />} />
        </Routes>
      </MemoryRouter>,
    )
  })
}

describe('Books screen', () => {
  beforeEach(() => {
    vi.mocked(CommerceClient.getCollection).mockResolvedValue(
      buildCollection({ name: 'Weekend Reads' }),
    )
    vi.mocked(CommerceClient.getBooks).mockResolvedValue({
      items: [
        buildBook({ id: 'book_1', title: 'The Quiet Harbor' }),
        buildBook({ id: 'book_2', title: 'The Golden Orchard', archived: true }),
      ],
      total: 2,
    })
  })

  afterEach(() => {
    // Unmount first, so resetting the stores does not update mounted components outside act().
    cleanup()
    useCommerceStore.setState(initialState)
    useStore.setState(initialGlobalState)
  })

  it('shows the collection name and its books', async () => {
    await renderScreen()

    expect(await screen.findByText('The Quiet Harbor')).toBeVisible()
    expect(screen.getByText('The Golden Orchard')).toBeVisible()
    expect(await screen.findByRole('heading', { name: 'Weekend Reads' })).toBeVisible()
  })

  it('requests the books of the collection in the URL', async () => {
    await renderScreen()

    await waitFor(() =>
      expect(CommerceClient.getBooks).toHaveBeenCalledWith(
        'col_1',
        { q: undefined, page: 1, limit: 10 },
        expect.any(AbortSignal),
      ),
    )
  })

  it('lets an editor archive and restore books', async () => {
    useStore.setState({ user: buildUser({ role: 'editor' }) })
    vi.mocked(CommerceClient.updateBook).mockResolvedValue(
      buildBook({ id: 'book_1', archived: true }),
    )

    await renderScreen()
    await userEvent.click(await screen.findByRole('button', { name: 'Archive' }))

    await waitFor(() =>
      expect(CommerceClient.updateBook).toHaveBeenCalledWith('book_1', { archived: true }),
    )
    expect(
      within(screen.getByTestId('book-row-book_1')).getByRole('button', { name: 'Restore' }),
    ).toBeVisible()
  })

  it('hides the actions column for a viewer', async () => {
    useStore.setState({ user: buildUser({ role: 'viewer' }) })

    await renderScreen()

    await screen.findByText('The Quiet Harbor')
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
  })

  it('shows the export button only when the exportCsv flag is on', async () => {
    useStore.setState({ user: buildUser({ role: 'manager' }) })

    await renderScreen()
    await screen.findByText('The Quiet Harbor')

    expect(screen.getByRole('button', { name: /Export this page/ })).toBeVisible()
  })

  it('does not show the export button without the flag', async () => {
    useStore.setState({ user: buildUser({ role: 'editor' }) })

    await renderScreen()
    await screen.findByText('The Quiet Harbor')

    expect(screen.queryByRole('button', { name: /Export this page/ })).not.toBeInTheDocument()
  })

  it('shows an error with retry when books cannot be loaded', async () => {
    vi.mocked(CommerceClient.getBooks).mockRejectedValueOnce(new Error('boom'))

    await renderScreen()

    expect(await screen.findByText('We could not load the books')).toBeVisible()
  })
})
