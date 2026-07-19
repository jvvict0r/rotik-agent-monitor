import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { ToastContext, type Toast, type ToastTone } from './toast-context'

const toneStyles: Record<ToastTone, string> = {
  success: 'border-healthy-500/30 bg-white text-slate-ink',
  error: 'border-danger-500/30 bg-white text-slate-ink',
  info: 'border-brand-200 bg-white text-slate-ink',
}

const dotStyles: Record<ToastTone, string> = {
  success: 'bg-healthy-500',
  error: 'bg-danger-500',
  info: 'bg-brand-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, tone, message }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4500)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:items-end"
        role="region"
        aria-live="polite"
        aria-label="Notificações"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-pop',
              toneStyles[toast.tone],
            )}
          >
            <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotStyles[toast.tone])} aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
