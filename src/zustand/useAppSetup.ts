// Loads the session once at startup. Also used by the DevToolbar to reload it after switching user.

import { SessionClient } from 'app/clients/SessionClient'
import { reportToMonitoring } from 'app/utils/reportToMonitoring'
import { useEffect } from 'react'
import useStore from './useStore'

export const loadSession = async ({ silent = false }: { silent?: boolean } = {}) => {
  const { setSession, setStatus } = useStore.getState()
  if (!silent) setStatus('loading')
  try {
    setSession(await SessionClient.getSession())
  } catch (error) {
    reportToMonitoring(error)
    if (!silent) setStatus('error')
  }
}

export const useAppSetup = () => {
  const status = useStore((state) => state.status)

  useEffect(() => {
    if (useStore.getState().status === 'idle') loadSession()
  }, [])

  return { status, retry: loadSession }
}
