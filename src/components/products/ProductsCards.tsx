import { useState } from 'react'
import { Package, Edit, Copy, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatPrice } from '@/utils'
import type { Product } from '@/types'

interface ProductsCardsProps {
  products: Product[]
  onEdit: (product: Product) => void
}

export function ProductsCards({ products, onEdit }: ProductsCardsProps) {
  const { deleteProduct, duplicateProduct, pagination, settings } = useStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { currencySymbol, priceDecimals } = settings.catalog

  const start = (pagination.page - 1) * pagination.perPage
  const paginated = products.slice(start, start + pagination.perPage)

  return (
    <div className="px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {paginated.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] overflow-hidden hover:shadow-elevated transition-shadow"
          >
            {/* Image */}
            <div className="aspect-square bg-[hsl(var(--surface-overlay))] relative overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-[hsl(var(--text-muted))]" />
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicateProduct(product.id)}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(product.id)}
                  className="p-2 rounded-lg bg-red-500/60 backdrop-blur-sm text-white hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                {product.name}
              </p>
              <p className="text-xs text-[hsl(var(--text-muted))] font-mono mt-0.5">
                {product.code}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                  {formatPrice(product.price, currencySymbol, priceDecimals)}
                </p>
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
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteProduct(deleteId)
          setDeleteId(null)
        }}
        title="Eliminar producto"
        description="¿Seguro que deseas eliminar este producto?"
      />
    </div>
  )
}
