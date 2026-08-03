import { useRef } from 'react'
import { Moon, Sun, Monitor, Download, Upload, Trash2, Shield } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { exportBackup, importBackup } from '@/lib/db'
import { downloadJSON } from '@/utils'
import type { AppSettings } from '@/types'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
      <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const { settings, updateSettings, notify, init } = useStore()
  const importRef = useRef<HTMLInputElement>(null)

  const setCatalog = <K extends keyof AppSettings['catalog']>(
    key: K,
    value: AppSettings['catalog'][K]
  ) => {
    updateSettings({ catalog: { ...settings.catalog, [key]: value } })
  }

  const handleExportBackup = () => {
    const data = exportBackup()
    downloadJSON(data, `catalogpro-backup-${new Date().toISOString().slice(0, 10)}.json`)
    notify({ type: 'success', title: 'Respaldo exportado' })
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        importBackup(data)
        init()
        notify({ type: 'success', title: 'Respaldo restaurado' })
      } catch {
        notify({ type: 'error', title: 'Error al importar respaldo' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const pageSizeOptions = [
    { value: 'a4', label: 'A4 (210 × 297 mm)' },
    { value: 'letter', label: 'Carta (215.9 × 279.4 mm)' },
    { value: 'legal', label: 'Oficio (215.9 × 355.6 mm)' },
  ]

  const orientationOptions = [
    { value: 'portrait', label: 'Vertical' },
    { value: 'landscape', label: 'Horizontal' },
  ]

  const themeOptions = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
  ]

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Configuración" description="Preferencias del sistema y del catálogo" />

      <div className="px-8 pb-8 flex-1 overflow-auto grid grid-cols-2 gap-6 content-start">
        {/* Appearance */}
        <SectionCard title="Apariencia">
          <div className="flex items-center gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Claro' },
              { value: 'dark', icon: Moon, label: 'Oscuro' },
              { value: 'system', icon: Monitor, label: 'Sistema' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value as AppSettings['theme'] })}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  settings.theme === value
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-strong))]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Currency */}
        <SectionCard title="Moneda y precios">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Moneda"
              placeholder="USD"
              value={settings.catalog.currency}
              onChange={(e) => setCatalog('currency', e.target.value)}
            />
            <Input
              label="Símbolo"
              placeholder="$"
              value={settings.catalog.currencySymbol}
              onChange={(e) => setCatalog('currencySymbol', e.target.value)}
            />
          </div>
          <Input
            label="Decimales"
            type="number"
            min={0}
            max={4}
            value={settings.catalog.priceDecimals}
            onChange={(e) => setCatalog('priceDecimals', Number(e.target.value))}
          />
        </SectionCard>

        {/* Page format */}
        <SectionCard title="Formato de página">
          <Select
            label="Tamaño"
            options={pageSizeOptions}
            value={settings.catalog.pageSize}
            onChange={(e) => setCatalog('pageSize', e.target.value as AppSettings['catalog']['pageSize'])}
          />
          <Select
            label="Orientación"
            options={orientationOptions}
            value={settings.catalog.orientation}
            onChange={(e) => setCatalog('orientation', e.target.value as AppSettings['catalog']['orientation'])}
          />
          <Input
            label="Margen (mm)"
            type="number"
            min={0}
            max={50}
            value={settings.catalog.margin}
            onChange={(e) => setCatalog('margin', Number(e.target.value))}
          />
        </SectionCard>

        {/* Quality */}
        <SectionCard title="Calidad del PDF">
          <div>
            <label className="text-sm font-medium text-[hsl(var(--text-primary))] block mb-2">
              Calidad de imagen: {Math.round(settings.catalog.quality * 100)}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(settings.catalog.quality * 100)}
              onChange={(e) => setCatalog('quality', Number(e.target.value) / 100)}
              className="w-full accent-[hsl(var(--accent))]"
            />
            <div className="flex justify-between text-xs text-[hsl(var(--text-muted))] mt-1">
              <span>Menor tamaño</span>
              <span>Mayor calidad</span>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.catalog.compression}
              onChange={(e) => setCatalog('compression', e.target.checked)}
              className="rounded"
            />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Compresión inteligente</p>
              <p className="text-xs text-[hsl(var(--text-muted))]">Reduce el tamaño sin perder calidad visible</p>
            </div>
          </label>
        </SectionCard>

        {/* Backup */}
        <div className="col-span-2">
          <SectionCard title="Respaldos y datos">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Exportar respaldo</p>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                  Descarga todos tus datos como un archivo JSON. Úsalo para hacer copias de seguridad o migrar a otro dispositivo.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportBackup}
              >
                Exportar
              </Button>
            </div>

            <div className="h-px bg-[hsl(var(--border))]" />

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Importar respaldo</p>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                  Restaura tus datos desde un archivo de respaldo. Los datos actuales serán reemplazados.
                </p>
              </div>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => importRef.current?.click()}
              >
                Importar
              </Button>
            </div>

            <div className="h-px bg-[hsl(var(--border))]" />

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--danger))]">Eliminar todos los datos</p>
                <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">
                  Borra permanentemente todos los productos, categorías y configuración. Esta acción no se puede deshacer.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  if (confirm('¿Seguro que deseas eliminar TODOS los datos? Esta acción es irreversible.')) {
                    localStorage.clear()
                    window.location.reload()
                  }
                }}
              >
                Borrar todo
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* About */}
        <div className="col-span-2">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent-subtle))] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">CatalogPro v1.0.0</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">
                  Todos los datos se guardan localmente en tu dispositivo. Sin servidores. Sin internet requerido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
