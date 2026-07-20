import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'
import { useOverlayDismiss } from './useOverlayDismiss'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, onClose, title, subtitle, children, footer }: DrawerProps) {
  const panelRef = useOverlayDismiss(open, onClose)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative flex h-full w-full flex-col bg-canvas shadow-pop sm:max-w-md',
          'motion-safe:animate-[drawer-in_180ms_cubic-bezier(0.2,0,0,1)]',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-hairline bg-surface px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-bold text-slate-ink">{title}</h2>
            {subtitle && <div className="mt-0.5 text-sm text-slate-muted">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            aria-label="Fechar histórico"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-muted transition hover:bg-slate-100 hover:text-slate-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="border-t border-hairline bg-surface px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
