/**
 * Global Zustand store — single source of truth for all app state.
 * Persistence is handled by the db layer (localStorage).
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  Product,
  Category,
  Gender,
  ProductType,
  AppSettings,
  Notification,
  HistoryEntry,
  FilterState,
  SortState,
  PaginationState,
  ViewMode,
} from '@/types'
import {
  ProductsDB,
  CategoriesDB,
  GendersDB,
  TypesDB,
  SettingsDB,
  HistoryDB,
} from '@/lib/db'
import { uid } from '@/utils'

// ── Store shape ───────────────────────────────────────────────

interface StoreState {
  // Data
  products: Product[]
  categories: Category[]
  genders: Gender[]
  types: ProductType[]
  settings: AppSettings
  history: HistoryEntry[]

  // UI
  notifications: Notification[]
  filters: FilterState
  sort: SortState
  pagination: PaginationState
  viewMode: ViewMode
  isLoading: boolean

  // Init
  init: () => void

  // Products CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id' | 'createdAt'>>) => void
  deleteProduct: (id: string) => void
  deleteProducts: (ids: string[]) => void
  duplicateProduct: (id: string) => Product | null

  // Categories CRUD
  addCategory: (cat: Omit<Category, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => Category
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id' | 'createdAt'>>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (orderedIds: string[]) => void

  // Genders CRUD
  addGender: (name: string) => Gender
  updateGender: (id: string, name: string) => void
  deleteGender: (id: string) => void

  // Types CRUD
  addType: (name: string) => ProductType
  updateType: (id: string, name: string) => void
  deleteType: (id: string) => void

  // Settings
  updateSettings: (patch: Partial<AppSettings>) => void

  // Notifications
  notify: (n: Omit<Notification, 'id'>) => void
  dismissNotification: (id: string) => void

  // Filters / sort / pagination / view
  setFilters: (filters: Partial<FilterState>) => void
  clearFilters: () => void
  setSort: (sort: SortState) => void
  setPagination: (p: Partial<PaginationState>) => void
  setViewMode: (mode: ViewMode) => void

  // Import helpers (bulk insert)
  importProducts: (products: Product[]) => void
  importCategories: (categories: Category[]) => void
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  categoryId: '',
  genderId: '',
  typeId: '',
  status: 'all',
}

export const useStore = create<StoreState>()((set, get) => ({
  products: [],
  categories: [],
  genders: [],
  types: [],
  settings: SettingsDB.get(),
  history: [],
  notifications: [],
  filters: DEFAULT_FILTERS,
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: { page: 1, perPage: 24 },
  viewMode: 'table',
  isLoading: false,

  // ── Init ────────────────────────────────────────────────────

  init: () => {
    set({
      products: ProductsDB.getAll(),
      categories: CategoriesDB.getAll(),
      genders: GendersDB.getAll(),
      types: TypesDB.getAll(),
      settings: SettingsDB.get(),
      history: HistoryDB.getAll(),
    })
  },

  // ── Products ────────────────────────────────────────────────

  addProduct: (data) => {
    const now = new Date().toISOString()
    const product: Product = {
      ...data,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    }
    const products = [product, ...get().products]
    ProductsDB.save(products)
    set({ products })
    get().notify({ type: 'success', title: 'Producto creado' })
    return product
  },

  updateProduct: (id, patch) => {
    const products = get().products.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
    )
    ProductsDB.save(products)
    set({ products })
  },

  deleteProduct: (id) => {
    const products = get().products.filter((p) => p.id !== id)
    ProductsDB.save(products)
    set({ products })
    get().notify({ type: 'success', title: 'Producto eliminado' })
  },

  deleteProducts: (ids) => {
    const idSet = new Set(ids)
    const products = get().products.filter((p) => !idSet.has(p.id))
    ProductsDB.save(products)
    set({ products })
    get().notify({ type: 'success', title: `${ids.length} productos eliminados` })
  },

  duplicateProduct: (id) => {
    const source = get().products.find((p) => p.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const copy: Product = {
      ...source,
      id: uid(),
      name: `${source.name} (copia)`,
      code: `${source.code}-copy`,
      createdAt: now,
      updatedAt: now,
    }
    const products = [copy, ...get().products]
    ProductsDB.save(products)
    set({ products })
    get().notify({ type: 'success', title: 'Producto duplicado' })
    return copy
  },

  // ── Categories ──────────────────────────────────────────────

  addCategory: (data) => {
    const now = new Date().toISOString()
    const category: Category = {
      ...data,
      id: uid(),
      order: get().categories.length,
      createdAt: now,
      updatedAt: now,
    }
    const categories = [...get().categories, category]
    CategoriesDB.save(categories)
    set({ categories })
    return category
  },

  updateCategory: (id, patch) => {
    const categories = get().categories.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    )
    CategoriesDB.save(categories)
    set({ categories })
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter((c) => c.id !== id)
    // Unlink products from deleted category
    const products = get().products.map((p) =>
      p.categoryId === id ? { ...p, categoryId: null } : p
    )
    CategoriesDB.save(categories)
    ProductsDB.save(products)
    set({ categories, products })
  },

  reorderCategories: (orderedIds) => {
    const map = new Map(get().categories.map((c) => [c.id, c]))
    const categories = orderedIds
      .map((id, i) => {
        const cat = map.get(id)
        return cat ? { ...cat, order: i } : null
      })
      .filter(Boolean) as Category[]
    CategoriesDB.save(categories)
    set({ categories })
  },

  // ── Genders ─────────────────────────────────────────────────

  addGender: (name) => {
    const gender: Gender = { id: uid(), name, createdAt: new Date().toISOString() }
    const genders = [...get().genders, gender]
    GendersDB.save(genders)
    set({ genders })
    return gender
  },

  updateGender: (id, name) => {
    const genders = get().genders.map((g) => (g.id === id ? { ...g, name } : g))
    GendersDB.save(genders)
    set({ genders })
  },

  deleteGender: (id) => {
    const genders = get().genders.filter((g) => g.id !== id)
    const products = get().products.map((p) =>
      p.genderId === id ? { ...p, genderId: null } : p
    )
    GendersDB.save(genders)
    ProductsDB.save(products)
    set({ genders, products })
  },

  // ── Types ───────────────────────────────────────────────────

  addType: (name) => {
    const type: ProductType = { id: uid(), name, createdAt: new Date().toISOString() }
    const types = [...get().types, type]
    TypesDB.save(types)
    set({ types })
    return type
  },

  updateType: (id, name) => {
    const types = get().types.map((t) => (t.id === id ? { ...t, name } : t))
    TypesDB.save(types)
    set({ types })
  },

  deleteType: (id) => {
    const types = get().types.filter((t) => t.id !== id)
    const products = get().products.map((p) =>
      p.typeId === id ? { ...p, typeId: null } : p
    )
    TypesDB.save(types)
    ProductsDB.save(products)
    set({ types, products })
  },

  // ── Settings ────────────────────────────────────────────────

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    SettingsDB.save(settings)
    set({ settings })
  },

  // ── Notifications ───────────────────────────────────────────

  notify: ({ type, title, message, duration = 4000 }) => {
    const id = nanoid()
    set((s) => ({ notifications: [...s.notifications, { id, type, title, message, duration }] }))
    if (duration > 0) {
      setTimeout(() => get().dismissNotification(id), duration)
    }
  },

  dismissNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
  },

  // ── UI state ────────────────────────────────────────────────

  setFilters: (patch) => {
    set((s) => ({ filters: { ...s.filters, ...patch }, pagination: { ...s.pagination, page: 1 } }))
  },

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSort: (sort) => set({ sort }),

  setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),

  setViewMode: (viewMode) => set({ viewMode }),

  // ── Import helpers ──────────────────────────────────────────

  importProducts: (incoming) => {
    const existing = get().products
    const existingIds = new Set(existing.map((p) => p.id))
    const toAdd = incoming.filter((p) => !existingIds.has(p.id))
    const products = [...existing, ...toAdd]
    ProductsDB.save(products)
    set({ products })
    get().notify({ type: 'success', title: `${toAdd.length} productos importados` })
  },

  importCategories: (incoming) => {
    const existing = get().categories
    const existingIds = new Set(existing.map((c) => c.id))
    const toAdd = incoming.filter((c) => !existingIds.has(c.id))
    const categories = [...existing, ...toAdd]
    CategoriesDB.save(categories)
    set({ categories })
  },
}))
