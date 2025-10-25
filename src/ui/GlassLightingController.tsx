import * as React from 'react'

function resetPanel(panel: HTMLElement | null) {
  if (!panel) return
  panel.style.removeProperty('--liquid-light-x')
  panel.style.removeProperty('--liquid-light-y')
  panel.style.removeProperty('--liquid-light-strength')
  panel.style.removeProperty('--liquid-light-secondary')
}

/**
 * Subtle pointer-driven highlight controller for interactive elements only.
 * Only applies lighting effects to elements with interactive classes.
 */
export function GlassLightingController() {
  React.useEffect(() => {
    let activePanel: HTMLElement | null = null

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      // 只对可交互元素生效，而不是主要面板
      const panel = target?.closest?.('.interactive-element, [data-cursor="interactive"], button, .firm-card, .interactive-panel') as HTMLElement | null

      if (!panel) {
        if (activePanel) {
          resetPanel(activePanel)
          activePanel = null
        }
        return
      }

      // 确保不是主要面板容器，但允许interactive-panel
      if ((panel.classList.contains('glass') || panel.classList.contains('liquid-panel')) && !panel.classList.contains('interactive-panel')) {
        if (activePanel) {
          resetPanel(activePanel)
          activePanel = null
        }
        return
      }

      if (panel !== activePanel) {
        if (activePanel) resetPanel(activePanel)
        activePanel = panel
      }

      const rect = panel.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      panel.style.setProperty('--liquid-light-x', `${x}%`)
      panel.style.setProperty('--liquid-light-y', `${y}%`)
      panel.style.setProperty('--liquid-light-strength', '0.08')
      panel.style.setProperty('--liquid-light-secondary', '0.04')
    }

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const panel = target?.closest?.('.interactive-element, [data-cursor="interactive"], button, .firm-card, .interactive-panel') as HTMLElement | null
      if (!panel) return
      const related = event.relatedTarget as HTMLElement | null
      if (related && panel.contains(related)) return

      if (panel === activePanel) {
        resetPanel(activePanel)
        activePanel = null
      }
    }

    const handlePointerLeaveWindow = () => {
      if (activePanel) {
        resetPanel(activePanel)
        activePanel = null
      }
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerout', handlePointerOut, true)
    window.addEventListener('blur', handlePointerLeaveWindow)
    window.addEventListener('pointerleave', handlePointerLeaveWindow)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerOut, true)
      window.removeEventListener('blur', handlePointerLeaveWindow)
      window.removeEventListener('pointerleave', handlePointerLeaveWindow)
      if (activePanel) resetPanel(activePanel)
    }
  }, [])

  return null
}
