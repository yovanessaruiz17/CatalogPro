import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[hsl(var(--text-primary))]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-[10px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
              'px-3 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))]',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-0 focus:border-[hsl(var(--accent))]',
              error && 'border-[hsl(var(--danger))] focus:ring-[hsl(var(--danger))]',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[hsl(var(--danger))]">{error}</p>}
        {hint && !error && <p className="text-xs text-[hsl(var(--text-muted))]">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
