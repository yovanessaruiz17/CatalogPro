import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--surface-overlay))] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[hsl(var(--text-muted))]" />
      </div>
      <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[hsl(var(--text-secondary))] max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
