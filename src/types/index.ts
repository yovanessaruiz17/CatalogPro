// ============================================================
// Core domain types for CatalogPro
// ============================================================

export type ProductStatus = 'active' | 'inactive' | 'draft'

export interface Product {
  id: string
  name: string
  code: string
  price: number
  image: string | null          // base64 or URL
  additionalImages: string[]
  categoryId: string | null
  genderId: string | null
  typeId: string | null
  description: string
  status: ProductStatus
  createdAt: string             // ISO date
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  image: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Gender {
  id: string
  name: string
  createdAt: string
}

export interface ProductType {
  id: string
  name: string
  createdAt: string
}

// ============================================================
// Catalog / PDF generation types
// ============================================================

export type PageSize = 'a4' | 'letter' | 'legal'
export type PageOrientation = 'portrait' | 'landscape'
export type ProductsPerPage = 2 | 4 | 6 | 8 | 9 | 12 | 16

export interface CatalogTemplate {
  id: ProductsPerPage
  label: string
  cols: number
  rows: number
}

export interface CatalogSettings {
  currency: string
  currencySymbol: string
  priceDecimals: number
  pageSize: PageSize
  orientation: PageOrientation
  margin: number               // mm
  quality: number              // 0.1–1.0
  compression: boolean
}

export interface CatalogGenerationOptions {
  backgroundImage: string | null
  categoryBackgroundImage: string | null
  template: ProductsPerPage
  includeCategories: string[]  // category IDs; empty = all
  includeCover: boolean
  includeBackCover: boolean
  coverTitle: string
  coverSubtitle: string
  businessName: string
  businessLogo: string | null
}

// ============================================================
// App settings & preferences
// ============================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  catalog: CatalogSettings
  language: string
}

// ============================================================
// History (undo/redo)
// ============================================================

export type HistoryAction =
  | { type: 'CREATE_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; before: Product; after: Product }
  | { type: 'DELETE_PRODUCT'; product: Product }
  | { type: 'CREATE_CATEGORY'; category: Category }
  | { type: 'UPDATE_CATEGORY'; before: Category; after: Category }
  | { type: 'DELETE_CATEGORY'; category: Category }

export interface HistoryEntry {
  id: string
  action: HistoryAction
  timestamp: string
  description: string
}

// ============================================================
// UI helpers
// ============================================================

export type ViewMode = 'table' | 'cards'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface FilterState {
  search: string
  categoryId: string
  genderId: string
  typeId: string
  status: ProductStatus | 'all'
}

export interface SortState {
  field: keyof Product
  direction: 'asc' | 'desc'
}

export interface PaginationState {
  page: number
  perPage: number
}
