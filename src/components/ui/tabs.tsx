import * as React from 'react'
import { cn } from '../../lib/utils'

export function Tabs({ value, onValueChange, children, className }:{ value: string, onValueChange: (v:string)=>void, children: React.ReactNode, className?: string }){
  return <div className={cn('grid gap-2', className)} data-value={value}>{children}</div>
}

export function TabsList({ children }:{ children: React.ReactNode }){
  return <div className="flex gap-2">{children}</div>
}

export function TabsTrigger({ value, current, onClick, children }:{ value:string, current:string, onClick:(v:string)=>void, children:React.ReactNode }){
  const active = value === current
  return (
    <button onClick={()=>onClick(value)} className={cn('px-3 py-1.5 rounded-md', active ? 'bg-secondary' : 'bg-secondary/60')}>{children}</button>
  )
}

export function TabsContent({ value, current, children, className }:{ value:string, current:string, children:React.ReactNode, className?:string }){
  if (value !== current) return null
  return <div className={cn('mt-2', className)}>{children}</div>
}
