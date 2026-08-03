import { cn } from '@/utils'
import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'accent'

interface BadgeProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

const styles: Record<Variant, string> = {
  default: 'bg-[hsl(var(--surface-overlay))] text-[hsl(var(--text-secondary))]',
  success: 'bg-[hsl(var(--success))/12] text-[hsl(var(--success))]',
  warning: 'bg-[hsl(var(--warning))/12] text-[hsl(var(--warning))]',
  danger:  'bg-[hsl(var(--danger))/12] text-[hsl(var(--danger))]',
  accent:  'bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
