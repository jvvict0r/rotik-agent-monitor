import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

type Tone = 'danger' | 'warning' | 'info'

const tones: Record<Tone, string> = {
  danger: 'border-danger-500/25 bg-danger-50 text-danger-600',
  warning: 'border-warning-500/25 bg-warning-50 text-warning-600',
  info: 'border-brand-200 bg-brand-50 text-brand-700',
}

export function Banner({
  tone = 'info',
  children,
  className,
  role = 'status',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
  role?: 'status' | 'alert'
}) {
  return (
    <div
      role={role}
      className={cx('flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-medium', tones[tone], className)}
    >
      {children}
    </div>
  )
}
