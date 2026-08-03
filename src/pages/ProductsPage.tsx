import { useMemo, useRef, useState } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { useStore } from '@/store'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductsToolbar } from '@/components/products/ProductsToolbar'
import { ProductsTable } from '@/components/products/ProductsTable'
import { ProductsCards } from '@/components/products/ProductsCards'
import { ProductForm } from '@/components/products/ProductForm'
import { useImportExport } from '@/hooks/useImportExport'
import { Package } from 'lucide-react'
import { sortByField } from '@/utils'
import type { Product } from '@/types'

export function ProductsPage() {
  const { products, filters, sort, viewMode } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const { exportProducts, importFromFile } = useImportExport()

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...products]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q)
      )
    }

    if (filters.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId)
    }

    if (filters.genderId) {
      result = result.filter((p) => p.genderId === filters.genderId)
    }

    if (filters.typeId) {
      result = result.filter((p) => p.typeId === filters.typeId)
    }

    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status)
    }

    return result.sort(sortByField<Product>(sort.field, sort.direction))
  }, [products, filters, sort])

  const openEdit = (product: Product) => {
    setEditTarget(product)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await importFromFile(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Productos"
        description={`${products.length} producto${products.length !== 1 ? 's' : ''} en total`}
        actions={
          <div className="flex items-center gap-2">
            {/* Import */}
            <input
              ref={importRef}
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => importRef.current?.click()}
            >
              Importar
            </Button>

            {/* Export */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setExportMenuOpen((v) => !v)}
              >
                Exportar
              </Button>
              {exportMenuOpen && (
                <div
                  className="absolute right-0 top-10 w-36 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-elevated z-20 py-1"
                  onMouseLeave={() => setExportMenuOpen(false)}
                >
                  {(['csv', 'json', 'xlsx'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      className="w-full text-left px-4 py-2 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                      onClick={() => {
                        exportProducts(fmt)
                        setExportMenuOpen(false)
                      }}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New product */}
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => { setEditTarget(null); setFormOpen(true) }}
            >
              Nuevo producto
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto pb-8">
        <ProductsToolbar />

        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay productos"
            description={
              products.length === 0
                ? 'Empieza creando tu primer producto.'
                : 'Ningún producto coincide con los filtros.'
            }
            action={
              products.length === 0 ? (
                <Button
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setFormOpen(true)}
                >
                  Crear producto
                </Button>
              ) : undefined
            }
          />
        ) : viewMode === 'table' ? (
          <ProductsTable products={filtered} onEdit={openEdit} />
        ) : (
          <ProductsCards products={filtered} onEdit={openEdit} />
        )}
      </div>

      <ProductForm open={formOpen} onClose={closeForm} product={editTarget} />
    </div>
  )
}
