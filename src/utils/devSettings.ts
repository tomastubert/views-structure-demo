// Dev-only switches stored in localStorage. The DevToolbar writes them; the mock server reads them
// on every request. This is demo infrastructure, not part of the real app logic.
export const DEMO_USERS = [
  { id: 'user-viewer', label: 'Alex (viewer)' },
  { id: 'user-editor', label: 'Sam (editor)' },
  { id: 'user-manager', label: 'Robin (manager)' },
] as const

export interface DevSettings {
  userId: string
  slowNetwork: boolean
  simulateErrors: boolean
}

const STORAGE_KEY = 'demo:settings'
const DEFAULTS: DevSettings = { userId: 'user-manager', slowNetwork: false, simulateErrors: false }

export const getDevSettings = (): DevSettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export const updateDevSettings = (patch: Partial<DevSettings>) => {
  const next = { ...getDevSettings(), ...patch }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode): the settings just won't persist.
  }
  return next
}
