import { Link } from 'react-router-dom'

export function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/50 border-b border-border/60">
      <div className="container max-w-none h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent/90" />
          <span className="font-semibold tracking-wide">NYC Startup → IPO Simulator</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Cash</span><span className="text-accent">$100,000</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Valuation</span><span>$2.5M</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Reputation</span><span>72</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Ownership</span><span>82%</span></div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80">Settings</Link>
          <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">Help</button>
        </div>
      </div>
    </div>
  )
}
