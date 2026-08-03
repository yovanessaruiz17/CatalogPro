import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Package, Tag, TrendingUp, BookOpen, ArrowRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: typeof Package
  label: string
  value: string | number
  sub?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{value}</p>
        <p className="text-sm font-medium text-[hsl(var(--text-primary))] mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[hsl(var(--text-muted))] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const { products, categories, settings } = useStore()

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status === 'active').length
    const totalValue = products.reduce((acc, p) => acc + p.price, 0)
    const avgPrice = products.length ? totalValue / products.length : 0

    return {
      total: products.length,
      active,
      categories: categories.length,
      avgPrice,
    }
  }, [products, categories])

  const recentProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [products]
  )

  const { currencySymbol, priceDecimals } = settings.catalog

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Resumen de tu catálogo"
        actions={
          <Link to="/products">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Agregar producto
            </Button>
          </Link>
        }
      />

      <div className="px-8 pb-8 flex-1 overflow-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Package}
            label="Total de productos"
            value={stats.total}
            sub={`${stats.active} activos`}
            color="hsl(246 83% 60%)"
            delay={0}
          />
          <StatCard
            icon={Tag}
            label="Categorías"
            value={stats.categories}
            color="hsl(142 72% 40%)"
            delay={0.05}
          />
          <StatCard
            icon={TrendingUp}
            label="Precio promedio"
            value={formatPrice(stats.avgPrice, currencySymbol, priceDecimals)}
            color="hsl(38 92% 50%)"
            delay={0.1}
          />
          <StatCard
            icon={BookOpen}
            label="Catálogos generados"
            value="—"
            sub="Genera tu primero"
            color="hsl(0 84% 60%)"
            delay={0.15}
          />
        </div>

        {/* Recent products */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
            <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
              Productos recientes
            </h2>
            <Link
              to="/products"
              className="flex items-center gap-1 text-xs text-[hsl(var(--accent))] hover:underline"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[hsl(var(--text-muted))]">
                No hay productos aún.{' '}
                <Link to="/products" className="text-[hsl(var(--accent))] hover:underline">
                  Crea el primero
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {recentProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-overlay))] overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-[hsl(var(--text-muted))]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-muted))]">{product.code}</p>
                  </div>
                  <div className="text-right shrink-0">
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
