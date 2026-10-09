import type { CommerceState } from '../store/useCommerceStore'

// Selectors passed to `useCommerceStore(...)` must return a primitive or a stable reference.
// Returning a derived object or array (e.g. `Object.values(state.collections)`) builds a new
// value on every call, so the component would re-render forever. Derive those in the component
// with `useMemo`, or select several fields at once with `useShallow`.
export const selectHasSyncingCollections = (state: Pick<CommerceState, 'collections'>) =>
  Object.values(state.collections).some((collection) => collection.status === 'syncing')
