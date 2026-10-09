import { act, cleanup, renderHook } from '@testing-library/react'
import { usePermission } from 'app/hooks/usePermission'
import { buildUser } from 'app/mocks/session/__fixtures__/buildUser'
import useStore from 'app/zustand/useStore'

describe('usePermission', () => {
  let initialState: ReturnType<typeof useStore.getState>

  beforeEach(() => {
    initialState = useStore.getState()
  })

  afterEach(() => {
    // Unmount first, so resetting the stores does not update mounted components outside act().
    cleanup()
    useStore.setState(initialState)
  })

  it('is true when the user has the permission', () => {
    act(() => useStore.setState({ user: buildUser({ role: 'manager' }) }))

    const { result } = renderHook(() => usePermission('collection:create'))

    expect(result.current).toBe(true)
  })

  it('is false when the user lacks the permission', () => {
    act(() => useStore.setState({ user: buildUser({ role: 'viewer' }) }))

    const { result } = renderHook(() => usePermission('collection:create'))

    expect(result.current).toBe(false)
  })

  it('is false when there is no user yet', () => {
    act(() => useStore.setState({ user: null }))

    const { result } = renderHook(() => usePermission('book:read'))

    expect(result.current).toBe(false)
  })
})
