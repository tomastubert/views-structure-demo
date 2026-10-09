// The global store is built from slices. Feature state does NOT go here:
// each view owns its own store (e.g. views/commerce/store/useCommerceStore.ts).
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type FlashSlice, createFlashSlice } from './flashStore'
import { type SessionSlice, createSessionSlice } from './sessionStore'

export type AppStore = SessionSlice & FlashSlice

const useStore = create<AppStore>()(
  devtools(
    (...args) => ({
      ...createSessionSlice(...args),
      ...createFlashSlice(...args),
    }),
    { name: 'Maple Books app store', enabled: import.meta.env.DEV },
  ),
)

export default useStore
