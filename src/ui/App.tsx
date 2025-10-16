import { TopBar } from './TopBar'
import { LeftPane } from './LeftPane'
import { CenterPane } from './CenterPane'
import { RightPane } from './RightPane'
import * as React from 'react'
import { CursorDot } from './CursorDot'

export function App() {
  React.useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.classList.add('cursor-dot-enabled')
    return () => { if (root) root.classList.remove('cursor-dot-enabled') }
  }, [])

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <TopBar />
      <div className="pt-16 h-[calc(100vh-64px)] w-full">
        <div className="grid grid-rows-[1fr] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)_360px] gap-4 px-4 md:px-6 h-full">
          <aside className="h-full overflow-hidden glass rounded-xl">
            <LeftPane />
          </aside>
          <main className="h-full overflow-hidden glass rounded-xl">
            <CenterPane />
          </main>
          <aside className="h-full overflow-hidden glass rounded-xl">
            <RightPane />
          </aside>
        </div>
      </div>
      <CursorDot />
    </div>
  )
}
