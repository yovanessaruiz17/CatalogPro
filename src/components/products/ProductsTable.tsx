import { useState } from 'react'
import {
  Package,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatPrice, cn } from '@/utils'
import type { Product } from '@/types'

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
}

export function ProductsTable({ products, onEdit }: ProductsTableProps) {
  const {
    deleteProduct,
    duplicateProduct,
    deleteProducts,
    sort,
    setSort,
    pagination,
    setPagination,
    settings,
  } = useStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteBulk, setDeleteBulk] = useState(false)

  const { currencySymbol, priceDecimals } = settings.catalog

  // Pagination
  const total = products.length
  const totalPages = Math.max(1, Math.ceil(total / pagination.perPage))
  const start = (pagination.page - 1) * pagination.perPage
  const paginated = products.slice(start, start + pagination.perPage)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paginated.map((p) => p.id)))
    }
  }

  const handleSort = (field: keyof Product) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ field, direction: 'asc' })
    }
  }

  const SortIcon = ({ field }: { field: keyof Product }) => (
    <ArrowUpDown
      className={cn(
        'w-3 h-3 ml-1',
        sort.field === field ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-muted))]'
      )}
    />
  )

  return (
    <div className="px-8">
      {/* Bulk actions */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-[hsl(var(--accent-subtle))] border border-[hsl(var(--accent))/20]"
        >
          <span className="text-sm font-medium text-[hsl(var(--accent))]">
            {selected.size} seleccionados
          </span>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteBulk(true)}
          >
            Eliminar selección
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-3 py-3 text-left w-14">Img</th>
                <th
                  className="px-3 py-3 text-left font-medium text-[hsl(var(--text-secondary))] cursor-pointer hover:text-[hsl(var(--text-primary))]"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">
                    Nombre <SortIcon field="name" />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left font-medium text-[hsl(var(--text-secondary))] cursor-pointer hover:text-[hsl(var(--text-primary))]"
                  onClick={() => handleSort('code')}
                >
                  <span className="flex items-center">
                    Código <SortIcon field="code" />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left font-medium text-[hsl(var(--text-secondary))] cursor-pointer hover:text-[hsl(var(--text-primary))]"
                  onClick={() => handleSort('price')}
                >
                  <span className="flex items-center">
                    Precio <SortIcon field="price" />
                  </span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-[hsl(var(--text-secondary))]">
                  Estado
                </th>
                <th className="px-3 py-3 text-right font-medium text-[hsl(var(--text-secondary))]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    'border-b border-[hsl(var(--border))] last:border-0 transition-colors',
                    selected.has(product.id)
                      ? 'bg-[hsl(var(--accent-subtle))]'
                      : 'hover:bg-[hsl(var(--surface-raised))]'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[hsl(var(--surface-overlay))] flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-[hsl(var(--text-muted))]" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-[hsl(var(--text-primary))] max-w-[180px] truncate">
                      {product.name}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <code className="text-xs font-mono text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-overlay))] px-2 py-0.5 rounded">
                      {product.code}
                    </code>
                  </td>
                  <td className="px-3 py-3 font-medium text-[hsl(var(--text-primary))]">
                    {formatPrice(product.price, currencySymbol, priceDecimals)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        product.status === 'active'
                          ? 'success'
                          : product.status === 'inactive'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {product.status === 'active'
                        ? 'Activo'
                        : product.status === 'inactive'
                        ? 'Inactivo'
                        : 'Borrador'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateProduct(product.id)}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))/8] transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
          <p className="text-xs text-[hsl(var(--text-muted))]">
            {total} producto{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination({ page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[hsl(var(--text-secondary))] px-2">
              {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() => setPagination({ page: Math.min(totalPages, pagination.page + 1) })}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm single delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteProduct(deleteId)
          setDeleteId(null)
        }}
        title="Eliminar producto"
        description="¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
      />

      {/* Confirm bulk delete */}
      <ConfirmDialog
        open={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={() => {
          deleteProducts(Array.from(selected))
          setSelected(new Set())
          setDeleteBulk(false)
        }}
        title={`Eliminar ${selected.size} productos`}
        description="¿Seguro que deseas eliminar los productos seleccionados? Esta acción no se puede deshacer."
        confirmLabel={`Eliminar ${selected.size}`}
      />
    </div>
  )
}
