import { create } from 'zustand'

interface FilterStore {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const useFilterStore = create<FilterStore>((set: (state: Partial<FilterStore>) => void) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}))