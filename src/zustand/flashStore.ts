// Slice for flash notifications (toasts). Global because any view can raise one.
import type { StateCreator } from 'zustand'

export const FlashType = { Positive: 'positive', Negative: 'negative', Info: 'info' } as const
export type FlashType = (typeof FlashType)[keyof typeof FlashType]

export interface FlashOptions {
  title?: string
  message: string
  type?: FlashType
}

export interface FlashEntity extends FlashOptions {
  key: number
}

export interface FlashSlice {
  flashes: Record<number, FlashEntity>
  lastFlashId: number
  addFlash: (options: FlashOptions) => void
  removeFlash: (key: number) => void
}

export const createFlashSlice: StateCreator<
  FlashSlice,
  [['zustand/devtools', never]],
  [],
  FlashSlice
> = (set) => ({
  flashes: {},
  lastFlashId: 0,
  addFlash: (options) =>
    set(
      (state) => {
        const key = state.lastFlashId + 1
        return {
          lastFlashId: key,
          flashes: { ...state.flashes, [key]: { type: FlashType.Info, ...options, key } },
        }
      },
      false,
      'flash/add',
    ),
  removeFlash: (key) =>
    set(
      (state) => {
        const { [key]: _removed, ...rest } = state.flashes
        return { flashes: rest }
      },
      false,
      'flash/remove',
    ),
})
