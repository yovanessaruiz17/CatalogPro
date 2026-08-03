import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[hsl(var(--text-primary))]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-9 rounded-[10px] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]',
              'px-3 pr-8 text-sm text-[hsl(var(--text-primary))] appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-[hsl(var(--accent))]',
              error && 'border-[hsl(var(--danger))]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-muted))] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[hsl(var(--danger))]">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
