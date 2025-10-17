import * as React from 'react'
import { useContent } from '../../hooks/useContent'

const Ctx = React.createContext<ReturnType<typeof useContent> | null>(null)

export function ContentProvider({ children }: { children: React.ReactNode }){
  const value = useContent()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContentCtx(){
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useContentCtx must be used within ContentProvider')
  return v
}
