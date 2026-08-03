import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotificationContainer } from '@/components/ui/NotificationContainer'

export default function App() {
  const { init, settings } = useStore()

  // Load persisted data on mount
  useEffect(() => {
    init()
  }, [init])

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement
    if (settings.theme === 'dark') {
      html.classList.add('dark')
    } else if (settings.theme === 'light') {
      html.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', prefersDark)
    }
  }, [settings.theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <NotificationContainer />
    </BrowserRouter>
  )
}
