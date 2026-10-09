// Slice for the current session (user + workspace). Global because every view needs it.

import type { User, Workspace } from 'app/types/user'
import type { StateCreator } from 'zustand'

export type SessionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SessionSlice {
  user: User | null
  workspace: Workspace | null
  status: SessionStatus
  setSession: (session: { user: User; workspace: Workspace }) => void
  setStatus: (status: SessionStatus) => void
}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [['zustand/devtools', never]],
  [],
  SessionSlice
> = (set) => ({
  user: null,
  workspace: null,
  status: 'idle',
  setSession: ({ user, workspace }) =>
    set({ user, workspace, status: 'success' }, false, 'session/set'),
  setStatus: (status) => set({ status }, false, 'session/setStatus'),
})
