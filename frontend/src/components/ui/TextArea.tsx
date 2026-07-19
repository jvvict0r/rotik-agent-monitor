import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-slate-ink">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'min-h-24 w-full min-w-0 resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-slate-ink shadow-card transition placeholder:text-slate-400',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:border-brand-400',
          error ? 'border-danger-500' : 'border-hairline hover:border-slate-300',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-slate-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
