/**
 * Global keyboard shortcuts for power users.
 *
 * N         → new product (when on /products)
 * /         → focus search bar
 * Escape    → close any open modal (handled by modals themselves)
 * Ctrl+,    → go to settings
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        // Trigger new product button if it exists on page
        document.querySelector<HTMLButtonElement>('[data-shortcut="new-product"]')?.click()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        navigate('/settings')
      }

      if (e.key === '/' && !e.ctrlKey) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]')?.focus()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])
}
