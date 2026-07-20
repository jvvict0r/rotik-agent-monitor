import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'
import { useOverlayDismiss } from './useOverlayDismiss'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const panelRef = useOverlayDismiss(open, onClose)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative w-full max-w-lg rounded-t-2xl border border-hairline bg-surface shadow-pop sm:rounded-2xl',
          className,
        )}
      >
        <div className="border-b border-hairline px-6 py-4">
          <h2 className="font-display text-lg font-bold text-slate-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-muted">{description}</p>}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
