import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildUser } from 'app/mocks/session/__fixtures__/buildUser'
import { buildCollection } from 'app/views/commerce/__fixtures__/buildCollection'
import { CommerceClient } from 'app/views/commerce/api/CommerceClient'
import { useCommerceStore } from 'app/views/commerce/store/useCommerceStore'
import useStore from 'app/zustand/useStore'
import { MemoryRouter } from 'react-router'
import Collections from './Collections'

vi.mock('app/views/commerce/api/CommerceClient')
vi.mock('app/utils/reportToMonitoring', () => ({ reportToMonitoring: vi.fn() }))

const initialState = useCommerceStore.getState()
const initialGlobalState = useStore.getState()

const renderScreen = async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/collections']}>
        <Collections />
      </MemoryRouter>,
    )
  })
}

describe('Collections screen', () => {
  beforeEach(() => {
    vi.mocked(CommerceClient.getCollections).mockResolvedValue([
      buildCollection({ id: 'col_1', name: 'Weekend Reads', bookCount: 14 }),
      buildCollection({ id: 'col_2', name: 'Classics Corner', bookCount: 25 }),
    ])
  })

  afterEach(() => {
    // Unmount first, so resetting the stores does not update mounted components outside act().
    cleanup()
    useCommerceStore.setState(initialState)
    useStore.setState(initialGlobalState)
  })

  it('shows the collections returned by the store', async () => {
    await renderScreen()

    expect(await screen.findByText('Weekend Reads')).toBeVisible()
    expect(screen.getByText('Classics Corner')).toBeVisible()
  })

  it('shows an empty state when there are no collections', async () => {
    vi.mocked(CommerceClient.getCollections).mockResolvedValue([])

    await renderScreen()

    expect(await screen.findByText('No collections yet')).toBeVisible()
  })

  it('shows an error with a retry button when loading fails', async () => {
    vi.mocked(CommerceClient.getCollections).mockRejectedValueOnce(new Error('boom'))

    await renderScreen()

    expect(await screen.findByText('We could not load the collections')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Weekend Reads')).toBeVisible()
  })

  it('shows the create and delete affordances for a manager', async () => {
    useStore.setState({ user: buildUser({ role: 'manager' }) })

    await renderScreen()

    expect(await screen.findByRole('button', { name: 'New collection' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete Weekend Reads' })).toBeVisible()
  })

  it('creates a collection and refreshes the list', async () => {
    useStore.setState({ user: buildUser({ role: 'manager' }) })
    vi.mocked(CommerceClient.createCollection).mockResolvedValue(
      buildCollection({ id: 'col_3', name: 'Poetry Nook' }),
    )

    await renderScreen()
    await userEvent.click(await screen.findByRole('button', { name: 'New collection' }))
    await userEvent.type(screen.getByLabelText(/Name/), 'Poetry Nook')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(CommerceClient.createCollection).toHaveBeenCalledWith({
        name: 'Poetry Nook',
        description: '',
      }),
    )
    // The store refreshes the list after creating, and tells the user it worked.
    expect(CommerceClient.getCollections).toHaveBeenCalledTimes(2)
    expect(Object.values(useStore.getState().flashes)[0]).toMatchObject({ type: 'positive' })
  })

  it('hides create and delete for a viewer', async () => {
    useStore.setState({ user: buildUser({ role: 'viewer' }) })

    await renderScreen()

    await screen.findByText('Weekend Reads')
    expect(screen.queryByRole('button', { name: 'New collection' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Weekend Reads' })).not.toBeInTheDocument()
  })

  it('deletes a collection after confirming', async () => {
    useStore.setState({ user: buildUser({ role: 'manager' }) })
    vi.mocked(CommerceClient.deleteCollection).mockResolvedValue(undefined)

    await renderScreen()
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Weekend Reads' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(CommerceClient.deleteCollection).toHaveBeenCalledWith('col_1'))
  })
})
