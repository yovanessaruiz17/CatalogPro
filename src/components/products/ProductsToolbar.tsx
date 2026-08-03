import { Search, LayoutGrid, List, X } from 'lucide-react'
import { useStore } from '@/store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { cn } from '@/utils'
import type { ViewMode } from '@/types'

export function ProductsToolbar() {
  const {
    filters,
    setFilters,
    clearFilters,
    viewMode,
    setViewMode,
    categories,
    genders,
    types,
  } = useStore()

  const hasFilters =
    filters.search ||
    filters.categoryId ||
    filters.genderId ||
    filters.typeId ||
    filters.status !== 'all'

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  const genderOptions = [
    { value: '', label: 'Todos los géneros' },
    ...genders.map((g) => ({ value: g.id, label: g.name })),
  ]

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...types.map((t) => ({ value: t.id, label: t.name })),
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'draft', label: 'Borradores' },
  ]

  return (
    <div className="px-8 mb-4 space-y-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, código..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-[hsl(var(--border))] rounded-[10px] p-0.5">
          {(['table', 'cards'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === mode
                  ? 'bg-[hsl(var(--accent))] text-white'
                  : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]'
              )}
            >
              {mode === 'table' ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={clearFilters}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2">
        <Select
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(e) => setFilters({ categoryId: e.target.value })}
          className="flex-1"
        />
        <Select
          options={genderOptions}
          value={filters.genderId}
          onChange={(e) => setFilters({ genderId: e.target.value })}
          className="flex-1"
        />
        <Select
          options={typeOptions}
          value={filters.typeId}
          onChange={(e) => setFilters({ typeId: e.target.value })}
          className="flex-1"
        />
        <Select
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
          className="flex-1"
        />
      </div>
    </div>
  )
}
