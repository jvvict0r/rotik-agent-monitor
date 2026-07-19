import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 ease-[cubic-bezier(0.2,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-lift hover:bg-brand-700 hover:shadow-pop focus-visible:outline-brand-500',
  secondary:
    'bg-surface text-slate-ink border border-hairline shadow-card hover:bg-brand-50 hover:border-brand-200',
  ghost: 'text-slate-muted hover:bg-brand-50 hover:text-brand-700',
  danger: 'bg-danger-500 text-white shadow-lift hover:bg-danger-600',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
})
