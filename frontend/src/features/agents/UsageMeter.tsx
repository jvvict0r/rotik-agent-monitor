import { useMemo } from 'react'
import { cx } from '@/lib/cx'
import { formatNumber } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { usageLabel, usageState, WARNING_THRESHOLD, type UsageState } from './usage'

interface UsageMeterProps {
  used: number
  limit: number
  percentage: number
  isBlocked: boolean
}

const fill: Record<UsageState, string> = {
  healthy: 'bg-brand-500',
  warning: 'bg-warning-500',
  blocked: 'bg-danger-500',
}

const readout: Record<UsageState, string> = {
  healthy: 'text-brand-700',
  warning: 'text-warning-600',
  blocked: 'text-danger-600',
}

const badgeTone: Record<UsageState, 'brand' | 'warning' | 'danger'> = {
  healthy: 'brand',
  warning: 'warning',
  blocked: 'danger',
}

export function UsageMeter({ used, limit, percentage, isBlocked }: UsageMeterProps) {
  const state = useMemo(() => usageState(percentage, isBlocked), [percentage, isBlocked])
  const width = Math.min(percentage, 100)

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge tone={badgeTone[state]}>{usageLabel[state]}</Badge>
          <p className="mt-2 font-mono text-sm text-slate-muted tabular">
            <span className="text-slate-ink">{formatNumber(used)}</span> / {formatNumber(limit)}{' '}
            execuções no mês
          </p>
        </div>
        <span className={cx('font-display text-3xl font-bold tabular', readout[state])}>
          {percentage}%
        </span>
      </div>

      <div
        className="relative mt-3 h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Consumo mensal em ${percentage}%`}
      >
        <div
          className={cx('h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.2,0,0,1)]', fill[state])}
          style={{ width: `${width}%` }}
        />
        <span
          className="absolute inset-y-0 w-px bg-slate-400/70"
          style={{ left: `${WARNING_THRESHOLD}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-1.5 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Alerta em {WARNING_THRESHOLD}%
      </p>
    </div>
  )
}
