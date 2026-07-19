import type { HTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type Tone = 'neutral' | 'brand' | 'healthy' | 'warning' | 'danger'

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  healthy: 'bg-healthy-50 text-healthy-500 ring-healthy-500/20',
  warning: 'bg-warning-50 text-warning-600 ring-warning-500/25',
  danger: 'bg-danger-50 text-danger-600 ring-danger-500/25',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
