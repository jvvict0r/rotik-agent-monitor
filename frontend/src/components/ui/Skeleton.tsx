import type { HTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('animate-pulse rounded-md bg-slate-200/70', className)}
      {...props}
    />
  )
}
