// While any collection is "syncing", refresh the list every few seconds (without a spinner).
import { useEffect } from 'react'
import { useCommerceStore } from '../../../store/useCommerceStore'
import { selectHasSyncingCollections } from '../../../utils/selectors'

const POLL_INTERVAL_MS = 3000

export const useCollectionsPolling = () => {
  const hasSyncing = useCommerceStore(selectHasSyncingCollections)
  const fetchCollections = useCommerceStore((state) => state.fetchCollections)

  useEffect(() => {
    if (!hasSyncing) return undefined
    const interval = setInterval(() => fetchCollections({ silent: true }), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [hasSyncing, fetchCollections])
}
