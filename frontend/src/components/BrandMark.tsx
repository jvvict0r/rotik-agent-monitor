import { cx } from '@/lib/cx'

interface BrandMarkProps {
  className?: string
  withWordmark?: boolean
  tone?: 'light' | 'dark'
}

export function BrandMark({ className, withWordmark = true, tone = 'light' }: BrandMarkProps) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span
        className="relative grid h-9 w-9 place-items-center rounded-[10px] bg-brand-600 shadow-lift"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M4 15a8 8 0 0 1 16 0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          <path d="M8 15a4 4 0 0 1 8 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.6" fill="white" />
        </svg>
      </span>
      {withWordmark && (
        <span
          className={cx(
            'font-display text-lg font-bold tracking-tight',
            tone === 'dark' ? 'text-white' : 'text-slate-ink',
          )}
        >
          Rotik
          <span className="text-brand-400">.</span>
        </span>
      )}
    </span>
  )
}
