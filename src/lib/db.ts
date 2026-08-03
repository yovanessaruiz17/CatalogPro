/**
 * CatalogPro — Local persistence layer
 *
 * Uses localStorage as the database. Each entity type has its own key.
 * For migration to PostgreSQL/MySQL/Firebase, replace the functions below
 * with API calls or SDK calls — the rest of the app stays untouched.
 *
 * Storage schema:
 *   catalogpro:products   → Product[]
 *   catalogpro:categories → Category[]
 *   catalogpro:genders    → Gender[]
 *   catalogpro:types      → ProductType[]
 *   catalogpro:settings   → AppSettings
 *   catalogpro:history    → HistoryEntry[]
 */

import type {
  Product,
  Category,
  Gender,
  ProductType,
  AppSettings,
  HistoryEntry,
} from '@/types'

const NS = 'catalogpro'

const key = (entity: string) => `${NS}:${entity}`

// ── Generic helpers ──────────────────────────────────────────

function read<T>(entity: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(entity))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(entity: string, value: T): void {
  localStorage.setItem(key(entity), JSON.stringify(value))
}

// ── Products ─────────────────────────────────────────────────

export const ProductsDB = {
  getAll: (): Product[] => read<Product[]>('products', []),
  save: (products: Product[]): void => write('products', products),
}

// ── Categories ───────────────────────────────────────────────

export const CategoriesDB = {
  getAll: (): Category[] => read<Category[]>('categories', []),
  save: (categories: Category[]): void => write('categories', categories),
}

// ── Genders ──────────────────────────────────────────────────

export const GendersDB = {
  getAll: (): Gender[] => read<Gender[]>('genders', []),
  save: (genders: Gender[]): void => write('genders', genders),
}

// ── Product Types ─────────────────────────────────────────────

export const TypesDB = {
  getAll: (): ProductType[] => read<ProductType[]>('types', []),
  save: (types: ProductType[]): void => write('types', types),
}

// ── Settings ─────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'es',
  catalog: {
    currency: 'USD',
    currencySymbol: '$',
    priceDecimals: 2,
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 10,
    quality: 0.85,
    compression: true,
  },
}

export const SettingsDB = {
  get: (): AppSettings => read<AppSettings>('settings', DEFAULT_SETTINGS),
  save: (settings: AppSettings): void => write('settings', settings),
}

// ── History ───────────────────────────────────────────────────

const MAX_HISTORY = 100

export const HistoryDB = {
  getAll: (): HistoryEntry[] => read<HistoryEntry[]>('history', []),
  push: (entry: HistoryEntry): void => {
    const current = HistoryDB.getAll()
    const updated = [entry, ...current].slice(0, MAX_HISTORY)
    write('history', updated)
  },
  clear: (): void => write('history', []),
}

// ── Backup & Restore ──────────────────────────────────────────

export interface BackupData {
  version: string
  exportedAt: string
  products: Product[]
  categories: Category[]
  genders: Gender[]
  types: ProductType[]
  settings: AppSettings
}

export function exportBackup(): BackupData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    products: ProductsDB.getAll(),
    categories: CategoriesDB.getAll(),
    genders: GendersDB.getAll(),
    types: TypesDB.getAll(),
    settings: SettingsDB.get(),
  }
}

export function importBackup(data: BackupData): void {
  ProductsDB.save(data.products ?? [])
  CategoriesDB.save(data.categories ?? [])
  GendersDB.save(data.genders ?? [])
  TypesDB.save(data.types ?? [])
  if (data.settings) SettingsDB.save(data.settings)
}
