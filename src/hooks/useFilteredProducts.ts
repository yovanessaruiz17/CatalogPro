/**
 * Derived selector — returns filtered + sorted products from the store.
 * Keeps filtering logic in one place, reusable across views.
 */

import { useMemo } from 'react'
import { useStore } from '@/store'
import { sortByField } from '@/utils'
import type { Product } from '@/types'

export function useFilteredProducts(): Product[] {
  const { products, filters, sort } = useStore()

  return useMemo(() => {
    let result = [...products]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (filters.categoryId) result = result.filter((p) => p.categoryId === filters.categoryId)
    if (filters.genderId)   result = result.filter((p) => p.genderId   === filters.genderId)
    if (filters.typeId)     result = result.filter((p) => p.typeId     === filters.typeId)
    if (filters.status !== 'all') result = result.filter((p) => p.status === filters.status)

    return result.sort(sortByField<Product>(sort.field, sort.direction))
  }, [products, filters, sort])
}
