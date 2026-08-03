/**
 * PDF Catalog Generator
 *
 * Generates a professional product catalog PDF using jsPDF.
 * The layout is fully automatic — no fixed positions.
 * Products are distributed in a grid that adapts to the template chosen.
 */

import { useCallback, useState } from 'react'
import jsPDF from 'jspdf'
import { useStore } from '@/store'
import type { CatalogGenerationOptions, Product } from '@/types'

// Page size dimensions in mm
const PAGE_SIZES = {
  a4:     { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
  legal:  { w: 215.9, h: 355.6 },
}

// Template grid definitions
const TEMPLATES: Record<number, { cols: number; rows: number }> = {
  2:  { cols: 2, rows: 1 },
  4:  { cols: 2, rows: 2 },
  6:  { cols: 3, rows: 2 },
  8:  { cols: 4, rows: 2 },
  9:  { cols: 3, rows: 3 },
  12: { cols: 4, rows: 3 },
  16: { cols: 4, rows: 4 },
}

type ProgressCallback = (pct: number, label: string) => void

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function imgToDataUrl(img: HTMLImageElement, quality = 0.85): string {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/jpeg', quality)
}

export function usePdfGenerator() {
  const { products, categories, settings } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const generate = useCallback(
    async (options: CatalogGenerationOptions, onProgress?: ProgressCallback) => {
      setIsGenerating(true)
      setProgress(0)
      setProgressLabel('Iniciando...')

      const report = (pct: number, label: string) => {
        setProgress(pct)
        setProgressLabel(label)
        onProgress?.(pct, label)
      }

      try {
        const { pageSize, orientation, margin, quality } = settings.catalog
        const dim = PAGE_SIZES[pageSize]
        const pw = orientation === 'portrait' ? dim.w : dim.h
        const ph = orientation === 'portrait' ? dim.h : dim.w

        const pdf = new jsPDF({
          orientation,
          unit: 'mm',
          format: [pw, ph],
        })

        const tpl = TEMPLATES[options.template] ?? TEMPLATES[4]
        const { cols, rows } = tpl
        const perPage = cols * rows

        // --- Filter and group products ---
        const activeProducts = products.filter((p) => p.status === 'active')
        const includedCats = options.includeCategories.length > 0
          ? options.includeCategories
          : categories.map((c) => c.id)

        const grouped: Array<{ category: typeof categories[0] | null; items: Product[] }> = []

        // Products with category
        for (const catId of includedCats) {
          const cat = categories.find((c) => c.id === catId)
          if (!cat) continue
          const items = activeProducts.filter((p) => p.categoryId === catId)
          if (items.length > 0) grouped.push({ category: cat, items })
        }

        // Products without category
        const uncategorized = activeProducts.filter((p) => !p.categoryId)
        if (uncategorized.length > 0) {
          grouped.push({ category: null, items: uncategorized })
        }

        let pageIndex = 0

        // ── Cover ──────────────────────────────────────────────
        if (options.includeCover) {
          report(5, 'Generando portada...')
          if (options.backgroundImage) {
            try {
              const img = await loadImage(options.backgroundImage)
              pdf.addImage(imgToDataUrl(img, quality), 'JPEG', 0, 0, pw, ph)
            } catch { /* skip */ }
          } else {
            pdf.setFillColor(20, 20, 30)
            pdf.rect(0, 0, pw, ph, 'F')
          }

          // Business logo
          if (options.businessLogo) {
            try {
              const logo = await loadImage(options.businessLogo)
              const lw = 40
              const lh = (logo.naturalHeight / logo.naturalWidth) * lw
              pdf.addImage(imgToDataUrl(logo, quality), 'JPEG', (pw - lw) / 2, ph * 0.3, lw, lh)
            } catch { /* skip */ }
          }

          // Title
          pdf.setFontSize(28)
          pdf.setTextColor(255, 255, 255)
          pdf.setFont('helvetica', 'bold')
          pdf.text(options.coverTitle || 'Catálogo', pw / 2, ph * 0.6, { align: 'center' })

          if (options.coverSubtitle) {
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'normal')
            pdf.text(options.coverSubtitle, pw / 2, ph * 0.67, { align: 'center' })
          }

          pageIndex++
        }

        // ── Category sections ──────────────────────────────────
        const totalGroups = grouped.length
        for (let gi = 0; gi < totalGroups; gi++) {
          const { category, items } = grouped[gi]
          const pct = 10 + Math.round((gi / totalGroups) * 80)
          report(pct, `Generando: ${category?.name ?? 'Sin categoría'}...`)

          // Category title page
          if (pageIndex > 0) pdf.addPage()
          pageIndex++

          if (options.categoryBackgroundImage) {
            try {
              const img = await loadImage(options.categoryBackgroundImage)
              pdf.addImage(imgToDataUrl(img, quality), 'JPEG', 0, 0, pw, ph * 0.35)
            } catch { /* skip */ }
          } else {
            pdf.setFillColor(category?.color ? hexToRgb(category.color) : [30, 30, 50] as [number,number,number])
            pdf.rect(0, 0, pw, ph * 0.35, 'F')
          }

          pdf.setFontSize(22)
          pdf.setTextColor(255, 255, 255)
          pdf.setFont('helvetica', 'bold')
          pdf.text(category?.name ?? 'Sin categoría', pw / 2, ph * 0.2, { align: 'center' })

          // Products grid on this page (continuing below the title band)
          const startY = ph * 0.38
          const usableH = ph - startY - margin
          const usableW = pw - margin * 2

          const cellW = usableW / cols
          const cellH = usableH / rows

          let cellIndex = 0
          let currentPage = false

          for (let i = 0; i < items.length; i++) {
            // Start a new page when the current one is full
            if (cellIndex >= perPage) {
              pdf.addPage()
              pageIndex++
              currentPage = true
              cellIndex = 0
            }

            const product = items[i]
            const col = cellIndex % cols
            const row = Math.floor(cellIndex / cols)

            const x = margin + col * cellW
            // First section: products start after the category band
            const y = currentPage ? margin + row * cellH : startY + row * cellH

            await drawProductCell(pdf, product, x, y, cellW, cellH, quality, settings.catalog)

            cellIndex++
          }
        }

        // ── Back cover ─────────────────────────────────────────
        if (options.includeBackCover) {
          report(95, 'Generando contraportada...')
          pdf.addPage()
          if (options.backgroundImage) {
            try {
              const img = await loadImage(options.backgroundImage)
              pdf.addImage(imgToDataUrl(img, quality), 'JPEG', 0, 0, pw, ph)
            } catch { /* skip */ }
          } else {
            pdf.setFillColor(20, 20, 30)
            pdf.rect(0, 0, pw, ph, 'F')
          }
          pdf.setFontSize(14)
          pdf.setTextColor(255, 255, 255)
          pdf.setFont('helvetica', 'normal')
          pdf.text(options.businessName || 'CatalogPro', pw / 2, ph / 2, { align: 'center' })
        }

        // ── Page numbers ───────────────────────────────────────
        const totalPages = pdf.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i)
          pdf.setFontSize(8)
          pdf.setTextColor(150, 150, 150)
          pdf.text(`${i} / ${totalPages}`, pw - 10, ph - 5, { align: 'right' })
        }

        report(100, 'Listo')
        pdf.save('catalogo.pdf')
        return pdf
      } finally {
        setIsGenerating(false)
        setProgress(0)
        setProgressLabel('')
      }
    },
    [products, categories, settings]
  )

  return { generate, isGenerating, progress, progressLabel }
}

// ── Helpers ──────────────────────────────────────────────────

async function drawProductCell(
  pdf: jsPDF,
  product: Product,
  x: number,
  y: number,
  w: number,
  h: number,
  quality: number,
  catalog: { currencySymbol: string; priceDecimals: number }
) {
  const pad = 3
  const imgH = h * 0.65
  const textY = y + imgH + pad

  // Cell background
  pdf.setFillColor(248, 248, 250)
  pdf.roundedRect(x + 1, y + 1, w - 2, h - 2, 2, 2, 'F')

  // Product image
  if (product.image) {
    try {
      const img = await loadImage(product.image)
      const dataUrl = imgToDataUrl(img, quality)
      pdf.addImage(dataUrl, 'JPEG', x + pad, y + pad, w - pad * 2, imgH - pad)
    } catch {
      // placeholder box
      pdf.setFillColor(220, 220, 230)
      pdf.rect(x + pad, y + pad, w - pad * 2, imgH - pad, 'F')
    }
  } else {
    pdf.setFillColor(220, 220, 230)
    pdf.rect(x + pad, y + pad, w - pad * 2, imgH - pad, 'F')
  }

  // Name
  pdf.setFontSize(clamp(w * 0.18, 6, 9))
  pdf.setTextColor(30, 30, 40)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(product.name, w - pad * 2)
  pdf.text(nameLines.slice(0, 2), x + pad, textY + 3)

  // Code
  pdf.setFontSize(clamp(w * 0.14, 5, 7.5))
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(120, 120, 135)
  pdf.text(product.code, x + pad, textY + 7.5)

  // Price
  pdf.setFontSize(clamp(w * 0.18, 6, 9))
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(80, 80, 200)
  const price = `${catalog.currencySymbol}${product.price.toFixed(catalog.priceDecimals)}`
  pdf.text(price, x + w - pad, textY + 3, { align: 'right' })
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}
