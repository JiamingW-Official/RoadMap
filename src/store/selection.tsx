import * as React from 'react'

interface SelectionState {
  selectedFirmId: number | null
  setSelectedFirmId: (id: number | null) => void
}

const SelectionContext = React.createContext<SelectionState | undefined>(undefined)

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedFirmId, setSelectedFirmId] = React.useState<number | null>(null)
  const value = React.useMemo(() => ({ selectedFirmId, setSelectedFirmId }), [selectedFirmId])
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection() {
  const ctx = React.useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider')
  return ctx
}
