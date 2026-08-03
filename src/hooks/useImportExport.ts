/**
 * Import/Export logic for products.
 * Supports CSV, JSON, and XLSX (Excel).
 */

import { useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useStore } from '@/store'
import { downloadBlob, downloadJSON, uid } from '@/utils'
import type { Product } from '@/types'

type ExportFormat = 'csv' | 'json' | 'xlsx'

interface ProductRow {
  id: string
  name: string
  code: string
  price: number
  categoryId: string
  genderId: string
  typeId: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    price: p.price,
    categoryId: p.categoryId ?? '',
    genderId: p.genderId ?? '',
    typeId: p.typeId ?? '',
    description: p.description,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

function rowToProduct(row: Partial<ProductRow>): Product {
  const now = new Date().toISOString()
  return {
    id: row.id || uid(),
    name: row.name ?? '',
    code: row.code ?? '',
    price: Number(row.price) || 0,
    image: null,
    additionalImages: [],
    categoryId: row.categoryId || null,
    genderId: row.genderId || null,
    typeId: row.typeId || null,
    description: row.description ?? '',
    status: (row.status as Product['status']) || 'active',
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now,
  }
}

export function useImportExport() {
  const { products, importProducts, notify } = useStore()

  const exportProducts = useCallback(
    (format: ExportFormat) => {
      const rows = products.map(productToRow)

      if (format === 'json') {
        downloadJSON(rows, 'productos.json')
        return
      }

      if (format === 'csv') {
        const csv = Papa.unparse(rows)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        downloadBlob(blob, 'productos.csv')
        return
      }

      if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Productos')
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        const blob = new Blob([buf], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        downloadBlob(blob, 'productos.xlsx')
      }
    },
    [products]
  )

  const importFromFile = useCallback(
    (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'json') {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target?.result as string) as Partial<ProductRow>[]
              importProducts(data.map(rowToProduct))
              resolve()
            } catch {
              notify({ type: 'error', title: 'Error al importar JSON' })
              reject(new Error('Invalid JSON'))
            }
          }
          reader.readAsText(file)
          return
        }

        if (ext === 'csv') {
          Papa.parse<Partial<ProductRow>>(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              importProducts(results.data.map(rowToProduct))
              resolve()
            },
            error: () => {
              notify({ type: 'error', title: 'Error al importar CSV' })
              reject(new Error('CSV parse error'))
            },
          })
          return
        }

        if (ext === 'xlsx' || ext === 'xls') {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer)
              const wb = XLSX.read(data, { type: 'array' })
              const ws = wb.Sheets[wb.SheetNames[0]]
              const rows = XLSX.utils.sheet_to_json<Partial<ProductRow>>(ws)
              importProducts(rows.map(rowToProduct))
              resolve()
            } catch {
              notify({ type: 'error', title: 'Error al importar Excel' })
              reject(new Error('XLSX parse error'))
            }
          }
          reader.readAsArrayBuffer(file)
          return
        }

        notify({ type: 'error', title: 'Formato no soportado', message: 'Usa CSV, JSON o XLSX' })
        reject(new Error('Unsupported format'))
      })
    },
    [importProducts, notify]
  )

  return { exportProducts, importFromFile }
}
