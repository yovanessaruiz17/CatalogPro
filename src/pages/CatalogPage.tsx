import { useState } from 'react'
import { BookOpen, Loader2, CheckCircle, FileDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { usePdfGenerator } from '@/hooks/usePdfGenerator'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import type { CatalogGenerationOptions, ProductsPerPage } from '@/types'

const TEMPLATE_OPTIONS = [
  { value: '2', label: '2 productos por página' },
  { value: '4', label: '4 productos por página' },
  { value: '6', label: '6 productos por página' },
  { value: '8', label: '8 productos por página' },
  { value: '9', label: '9 productos por página' },
  { value: '12', label: '12 productos por página' },
  { value: '16', label: '16 productos por página' },
]

export function CatalogPage() {
  const { products, categories } = useStore()
  const { generate, isGenerating, progress, progressLabel } = usePdfGenerator()

  const [options, setOptions] = useState<CatalogGenerationOptions>({
    backgroundImage: null,
    categoryBackgroundImage: null,
    template: 4,
    includeCategories: [],
    includeCover: true,
    includeBackCover: true,
    coverTitle: 'Catálogo de Productos',
    coverSubtitle: '',
    businessName: '',
    businessLogo: null,
  })

  const activeCount = products.filter((p) => p.status === 'active').length

  const set = <K extends keyof CatalogGenerationOptions>(
    key: K,
    value: CatalogGenerationOptions[K]
  ) => setOptions((prev) => ({ ...prev, [key]: value }))

  const handleGenerate = () => {
    generate(options)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Generador de Catálogo"
        description={`${activeCount} productos activos listos para exportar`}
        actions={
          <Button
            leftIcon={isGenerating ? undefined : <FileDown className="w-4 h-4" />}
            onClick={handleGenerate}
            disabled={isGenerating || activeCount === 0}
            loading={isGenerating}
          >
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Button>
        }
      />

      <div className="px-8 pb-8 flex-1 overflow-auto">
        {/* Progress bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-xl border border-[hsl(var(--accent))/30] bg-[hsl(var(--accent-subtle))]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-4 h-4 text-[hsl(var(--accent))] animate-spin" />
                <span className="text-sm font-medium text-[hsl(var(--accent))]">
                  {progressLabel}
                </span>
                <span className="ml-auto text-sm font-mono text-[hsl(var(--accent))]">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 bg-[hsl(var(--accent))/20] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[hsl(var(--accent))] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-8">
          {/* Left column — images */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4">
                Imágenes del catálogo
              </h2>
              <div className="space-y-5">
                <ImageUploader
                  label="Imagen de fondo (todas las páginas)"
                  hint="Se usará como fondo en la portada y contraportada"
                  value={options.backgroundImage}
                  onChange={(v) => set('backgroundImage', v)}
                />
                <ImageUploader
                  label="Fondo para títulos de categoría"
                  hint="Aparecerá en la banda superior de cada sección"
                  value={options.categoryBackgroundImage}
                  onChange={(v) => set('categoryBackgroundImage', v)}
                />
                <ImageUploader
                  label="Logo de la empresa (opcional)"
                  hint="Se mostrará en la portada"
                  value={options.businessLogo}
                  onChange={(v) => set('businessLogo', v)}
                />
              </div>
            </div>
          </div>

          {/* Right column — options */}
          <div className="space-y-6">
            {/* Template */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4">
                Plantilla
              </h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {([2, 4, 6, 8, 9, 12, 16] as ProductsPerPage[]).map((n) => (
                  <button
                    key={n}
                    onClick={() => set('template', n)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                      options.template === n
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]'
                        : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-strong))]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[hsl(var(--text-muted))]">
                Productos por página seleccionado: <strong>{options.template}</strong>
              </p>
            </div>

            {/* Cover */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Portada</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeCover}
                    onChange={(e) => set('includeCover', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-[hsl(var(--text-secondary))]">Incluir</span>
                </label>
              </div>
              {options.includeCover && (
                <>
                  <Input
                    label="Título"
                    placeholder="Catálogo de Productos"
                    value={options.coverTitle}
                    onChange={(e) => set('coverTitle', e.target.value)}
                  />
                  <Input
                    label="Subtítulo"
                    placeholder="2024 · Colección principal"
                    value={options.coverSubtitle}
                    onChange={(e) => set('coverSubtitle', e.target.value)}
                  />
                  <Input
                    label="Nombre del negocio"
                    placeholder="Mi Empresa S.A."
                    value={options.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                  />
                </>
              )}
            </div>

            {/* Back cover */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Contraportada</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeBackCover}
                    onChange={(e) => set('includeBackCover', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-[hsl(var(--text-secondary))]">Incluir</span>
                </label>
              </div>
            </div>

            {/* Categories filter */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5">
              <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">
                Categorías a incluir
              </h2>
              <p className="text-xs text-[hsl(var(--text-muted))] mb-3">
                Sin selección = todas las categorías
              </p>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={
                        options.includeCategories.length === 0 ||
                        options.includeCategories.includes(cat.id)
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          set('includeCategories', [...options.includeCategories, cat.id])
                        } else {
                          set(
                            'includeCategories',
                            options.includeCategories.filter((id) => id !== cat.id)
                          )
                        }
                      }}
                      className="rounded"
                    />
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="text-sm text-[hsl(var(--text-primary))]">{cat.name}</span>
                  </label>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-[hsl(var(--text-muted))]">
                    No hay categorías creadas.
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-overlay))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Resumen</span>
              </div>
              <ul className="space-y-1 text-xs text-[hsl(var(--text-secondary))]">
                <li>• {activeCount} productos activos</li>
                <li>• {categories.length} categorías</li>
                <li>• Plantilla: {options.template} por página</li>
                <li>• {options.includeCover ? 'Con portada' : 'Sin portada'}</li>
                <li>• {options.includeBackCover ? 'Con contraportada' : 'Sin contraportada'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
