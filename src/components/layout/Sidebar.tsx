import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  BookOpen,
  Settings,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utils'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Productos' },
  { to: '/categories', icon: Tag, label: 'Categorías' },
  { to: '/catalog', icon: BookOpen, label: 'Catálogo' },
]

export function Sidebar() {
  return (
    <aside className="w-60 flex flex-col h-full border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--border))]">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-[hsl(var(--text-primary))] leading-tight">CatalogPro</p>
          <p className="text-[11px] text-[hsl(var(--text-muted))]">v1.0.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-overlay))] hover:text-[hsl(var(--text-primary))]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-4 h-4', isActive ? 'text-[hsl(var(--accent))]' : '')} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[hsl(var(--border))]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]'
                : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-overlay))] hover:text-[hsl(var(--text-primary))]'
            )
          }
        >
          <Settings className="w-4 h-4" />
          Configuración
        </NavLink>
      </div>
    </aside>
  )
}
