import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-surface/60 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-slate-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
