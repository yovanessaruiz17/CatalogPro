import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[hsl(var(--text-primary))]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-[10px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
            'px-3 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))]',
            'resize-none transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-[hsl(var(--accent))]',
            error && 'border-[hsl(var(--danger))]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[hsl(var(--danger))]">{error}</p>}
        {hint && !error && <p className="text-xs text-[hsl(var(--text-muted))]">{hint}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
