import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/utils'
import type { Notification } from '@/types'

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: 'border-[hsl(var(--success))/20] bg-[hsl(var(--success))/8] text-[hsl(var(--success))]',
  error: 'border-[hsl(var(--danger))/20] bg-[hsl(var(--danger))/8] text-[hsl(var(--danger))]',
  warning: 'border-[hsl(var(--warning))/20] bg-[hsl(var(--warning))/8] text-[hsl(var(--warning))]',
  info: 'border-[hsl(var(--accent))/20] bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]',
}

function Toast({ notification }: { notification: Notification }) {
  const dismiss = useStore((s) => s.dismissNotification)
  const Icon = ICONS[notification.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-start gap-3 w-80 p-4 rounded-xl border shadow-elevated',
        'bg-[hsl(var(--surface))]'
      )}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', STYLES[notification.type].split(' ')[2])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{notification.title}</p>
        {notification.message && (
          <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))]">{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(notification.id)}
        className="p-0.5 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function NotificationContainer() {
  const notifications = useStore((s) => s.notifications)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} />
        ))}
      </AnimatePresence>
    </div>
  )
}
