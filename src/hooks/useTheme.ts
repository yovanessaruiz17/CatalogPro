import { useEffect } from 'react'
import { useStore } from '@/store'

/**
 * Applies the selected theme to the <html> element and responds
 * to system preference changes when theme is set to 'system'.
 */
export function useTheme() {
  const theme = useStore((s) => s.settings.theme)

  useEffect(() => {
    const html = document.documentElement

    const apply = (dark: boolean) => html.classList.toggle('dark', dark)

    if (theme === 'dark') {
      apply(true)
      return
    }

    if (theme === 'light') {
      apply(false)
      return
    }

    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)

    const listener = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])
}
