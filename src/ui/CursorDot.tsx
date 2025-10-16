import * as React from 'react'
import { createPortal } from 'react-dom'

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, [data-cursor="interactive"], .leaflet-interactive'

function hasTouches(e: any): e is TouchEvent { return !!e && 'touches' in e }

export function CursorDot() {
  const dotRef = React.useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  React.useEffect(() => {
    let lastX = window.innerWidth / 2
    let lastY = window.innerHeight / 2
    let raf = 0
    let listenersBound = false

    const isInteractive = (el: Element | null) => !!(el && typeof el.closest === 'function' && el.closest(INTERACTIVE_SELECTOR))

    const onMove = (e: MouseEvent | PointerEvent | TouchEvent) => {
      if (hasTouches(e) && e.touches && e.touches.length > 0) {
        const t = e.touches[0]
        lastX = t?.clientX ?? lastX
        lastY = t?.clientY ?? lastY
      } else {
        const ev = e as MouseEvent
        lastX = typeof ev.clientX === 'number' ? ev.clientX : lastX
        lastY = typeof ev.clientY === 'number' ? ev.clientY : lastY
      }
      const target = (e as any)?.target as Element | null
      const el = dotRef.current
      if (el) {
        if (isInteractive(target)) el.classList.add('cursor-dot--interactive')
        else el.classList.remove('cursor-dot--interactive')
      }
    }

    const tick = () => {
      const el = dotRef.current
      if (el) {
        el.style.left = lastX + 'px'
        el.style.top = lastY + 'px'
        if (el.style.opacity !== '1') el.style.opacity = '1'
      }
      raf = requestAnimationFrame(tick)
    }

    const bindOn = (host: EventTarget | null) => {
      if (!host || listenersBound) return
      const opts = { passive: true } as AddEventListenerOptions
      host.addEventListener('pointermove', onMove as any, opts)
      host.addEventListener('mousemove', onMove as any, opts)
      host.addEventListener('touchmove', onMove as any, opts)
      listenersBound = true
    }

    const root = document.getElementById('root')
    bindOn(root)
    if (!listenersBound) bindOn(window)
    if (!listenersBound) bindOn(document)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (root) {
        root.removeEventListener('pointermove', onMove as any)
        root.removeEventListener('mousemove', onMove as any)
        root.removeEventListener('touchmove', onMove as any)
      }
      window.removeEventListener('pointermove', onMove as any)
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('touchmove', onMove as any)
      document.removeEventListener('pointermove', onMove as any)
      document.removeEventListener('mousemove', onMove as any)
      document.removeEventListener('touchmove', onMove as any)
    }
  }, [])

  if (!mounted) return null
  return createPortal(
    <div ref={dotRef} className="cursor-dot" style={{ left: '50vw', top: '50vh', opacity: 0 }} />,
    document.body,
  )
}
