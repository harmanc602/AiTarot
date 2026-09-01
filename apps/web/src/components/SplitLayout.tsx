import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SplitLayoutProps {
  wheelOrReveal: React.ReactNode // wheel picker OR reveal screen
  chat: React.ReactNode // persistent chat interface
}

/** The wheel/reading pane may take between 40% and 60% of the width. */
const MIN_RATIO = 40
const MAX_RATIO = 60
const DEFAULT_RATIO = 50
const KEY_STEP = 2

const clampRatio = (value: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, value))

/**
 * Two-pane layout. Which pane is visible never changes — the chat is always
 * reachable — but how the two share the viewport depends on its shape:
 *
 * - Landscape (width >= height): side by side, with a draggable divider so the
 *   user decides how much room the wheel gets (40%–60%).
 * - Portrait (height > width): stacking both panes leaves neither enough room,
 *   so only one is shown at a time and a segmented control switches between
 *   them. Both stay mounted (chat history and the wheel's measured geometry
 *   survive switching) — the inactive one is just hidden.
 */
export default function SplitLayout({ wheelOrReveal, chat }: SplitLayoutProps) {
  const { t } = useTranslation()
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerHeight > window.innerWidth,
  )
  const [ratio, setRatio] = useState(DEFAULT_RATIO)
  const [activePane, setActivePane] = useState<'cards' | 'chat'>('cards')

  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    window.addEventListener('resize', updateOrientation)
    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  const applyPointer = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    if (width === 0) return
    setRatio(clampRatio(((clientX - left) / width) * 100))
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      e.currentTarget.setPointerCapture?.(e.pointerId)
      applyPointer(e.clientX)
    },
    [applyPointer],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      applyPointer(e.clientX)
    },
    [applyPointer],
  )

  const endDrag = useCallback(() => {
    dragging.current = false
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setRatio((r) => clampRatio(r - KEY_STEP))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setRatio((r) => clampRatio(r + KEY_STEP))
    } else if (e.key === 'Home' || e.key === 'Enter') {
      e.preventDefault()
      setRatio(DEFAULT_RATIO)
    }
  }, [])

  if (isPortrait) {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Pane switcher. shrink-0 so it never steals height from the pane. */}
        <div className="shrink-0 border-b border-lavender/20 bg-deep-purple/40 px-3 py-2">
          <div
            role="tablist"
            aria-label={t('layout.switcher')}
            className="mx-auto flex max-w-xs gap-1 rounded-full border border-lavender/30 bg-black/30 p-1"
          >
            {(['cards', 'chat'] as const).map((pane) => (
              <button
                key={pane}
                type="button"
                role="tab"
                aria-selected={activePane === pane}
                onClick={() => setActivePane(pane)}
                className={`flex-1 rounded-full px-4 py-1.5 font-sans text-sm transition-colors ${
                  activePane === pane
                    ? 'bg-lavender/80 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {t(`layout.${pane}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Both panes are stacked in the same box and stay mounted; the inactive
            one is hidden with `invisible` rather than unmounted or display:none
            so it keeps its real measured size (the wheel and the reveal grid
            size themselves from a ResizeObserver). */}
        <div className="relative min-h-0 flex-1">
          <div
            className={`absolute inset-0 ${
              activePane === 'cards' ? '' : 'invisible pointer-events-none'
            }`}
            aria-hidden={activePane !== 'cards'}
          >
            {wheelOrReveal}
          </div>
          <div
            className={`absolute inset-0 ${
              activePane === 'chat' ? '' : 'invisible pointer-events-none'
            }`}
            aria-hidden={activePane !== 'chat'}
          >
            {chat}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div className="relative min-w-0" style={{ width: `${ratio}%` }}>
        {wheelOrReveal}
      </div>

      {/* Draggable divider. Wider hit area than its visible line so it's easy
          to grab; double-click (or Home/Enter when focused) resets to 50/50. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t('layout.resize')}
        aria-valuenow={Math.round(ratio)}
        aria-valuemin={MIN_RATIO}
        aria-valuemax={MAX_RATIO}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setRatio(DEFAULT_RATIO)}
        onKeyDown={onKeyDown}
        className="group relative z-20 w-2 shrink-0 cursor-col-resize touch-none bg-lavender/20 transition-colors hover:bg-lavender/50 focus:bg-lavender/60 focus:outline-none"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 group-hover:bg-white/80" />
      </div>

      <div className="relative min-w-0 flex-1">{chat}</div>
    </div>
  )
}
