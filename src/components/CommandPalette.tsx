import * as React from 'react'
import { useContentCtx } from '../ui/providers/ContentProvider'
import { useSelection } from '../store/selection'
import { useCategoryFilter } from '../store/categoryFilter'
import { CATEGORY_ORDER, CATEGORY_HEX } from '../constants/categories'
import type { FirmCategory } from '../types/firm'

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

type CommandItem = {
  id: string
  label: string
  subtitle?: string
  section: string
  action: () => void
  meta?: Record<string, unknown>
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { firms } = useContentCtx()
  const { setSelectedFirmId } = useSelection()
  const toggleCategory = useCategoryFilter((s) => s.toggle)
  const resetCategories = useCategoryFilter((s) => s.reset)
  const active = useCategoryFilter((s) => s.active)

  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const commands = React.useMemo<CommandItem[]>(() => {
    const firmCommands: CommandItem[] = firms.map((firm) => ({
      id: `firm-${firm.id}`,
      label: firm.firm_name,
      subtitle: `${firm.category} · ${firm.hq_address}`,
      section: 'Firms',
      action: () => setSelectedFirmId(firm.id),
    })).slice(0, 50)

    const categoryCommands: CommandItem[] = CATEGORY_ORDER.map((cat) => ({
      id: `category-${cat}`,
      label: `${active[cat] ? 'Disable' : 'Enable'} ${cat}`,
      subtitle: active[cat] ? 'Filtering active' : 'Filtering inactive',
      section: 'Filters',
      action: () => toggleCategory(cat),
      meta: { cat },
    }))

    return [
      ...categoryCommands,
      {
        id: 'filters-reset',
        label: 'Reset category filters',
        section: 'Filters',
        action: () => resetCategories(),
      },
      ...firmCommands,
    ]
  }, [firms, setSelectedFirmId, toggleCategory, resetCategories, active])

  const filtered = React.useMemo(() => {
    const t = query.trim().toLowerCase()
    if (!t) return commands
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(t) || cmd.subtitle?.toLowerCase().includes(t))
  }, [commands, query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[5000] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-32" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-background/90 backdrop-blur-xl shadow-2xl">
        <div className="px-4 pb-3 pt-4 border-b border-white/10">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a firm or toggle a filter..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 outline-none"
            data-cursor="text"
          />
        </div>
        <div className="max-h-80 overflow-auto py-2">
          {filtered.length === 0 && (
            <div className="px-5 py-4 text-sm text-foreground/60">No matches</div>
          )}
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.action()
                onClose()
              }}
              className="w-full px-5 py-3 text-left text-sm hover:bg-white/6 focus:bg-white/8 transition flex items-center justify-between"
              data-cursor="interactive"
            >
              <div className="flex items-center gap-3">
                {cmd.id.startsWith('firm-') && (
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" aria-hidden />
                )}
                {cmd.meta?.cat && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: CATEGORY_HEX[cmd.meta.cat as FirmCategory] ?? 'rgba(148,163,184,0.6)' }}
                    aria-hidden
                  />
                )}
                <div className="font-medium text-foreground/90">{cmd.label}</div>
              </div>
              <div className="flex flex-col items-end">
                {cmd.subtitle && <div className="text-xs text-foreground/50">{cmd.subtitle}</div>}
                <span className="text-[10px] uppercase tracking-[0.12em] text-foreground/40">{cmd.section}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
