import { TopBar } from './TopBar'
import { LeftPane } from './LeftPane'
import { CenterPane } from './CenterPane'
import { RightPane } from './RightPane'
import * as React from 'react'
import { CursorDot } from './CursorDot'
import { ContentProvider } from '../ui/providers/ContentProvider'
import { Toaster } from '../components/ui/toast'
import { CommandPalette } from '../components/CommandPalette'
import { MarketTicker } from '../components/MarketTicker'
import { GlassLightingController } from './GlassLightingController'

export function App() {
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  React.useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.classList.add('cursor-dot-enabled')
    document.body.classList.add('cursor-dot-enabled')
    return () => {
      if (root) root.classList.remove('cursor-dot-enabled')
      document.body.classList.remove('cursor-dot-enabled')
    }
  }, [])

  React.useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <Toaster>
        <ContentProvider>
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <div className="pt-20 h-[calc(100vh-80px)] w-full px-3 md:px-4">
            <div className="grid grid-rows-[1fr] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)_360px] gap-4 h-full">
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
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <MarketTicker />
          <CursorDot />
          <GlassLightingController />
        </ContentProvider>
      </Toaster>
    </div>
  )
}
