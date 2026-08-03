import { useState } from 'react'
import { Plus, Edit, Trash2, Tag, GripVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/store'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageUploader } from '@/components/ui/ImageUploader'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  color: z.string(),
  image: z.string().nullable(),
})

type FormValues = z.infer<typeof schema>

function CategoryForm({
  open,
  onClose,
  category,
}: {
  open: boolean
  onClose: () => void
  category?: Category | null
}) {
  const { addCategory, updateCategory } = useStore()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? '', color: category?.color ?? '#6366f1', image: category?.image ?? null },
  })

  const image = watch('image')

  const onSubmit = (values: FormValues) => {
    if (category) {
      updateCategory(category.id, values)
    } else {
      addCategory(values)
    }
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-5 space-y-4">
          <ImageUploader
            value={image}
            onChange={(v) => setValue('image', v)}
            label="Imagen de categoría"
          />
          <Input label="Nombre *" error={errors.name?.message} {...register('name')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[hsl(var(--text-primary))]">Color</label>
            <input type="color" {...register('color')} className="h-9 w-full rounded-[10px] border border-[hsl(var(--border))] cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{category ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function CategoriesPage() {
  const { categories, deleteCategory, products, genders, addGender, deleteGender, types, addType, deleteType } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newGender, setNewGender] = useState('')
  const [newType, setNewType] = useState('')

  const productCountForCategory = (id: string) =>
    products.filter((p) => p.categoryId === id).length

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Categorías"
        description="Organiza tus productos en categorías"
        actions={
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            Nueva categoría
          </Button>
        }
      />

      <div className="px-8 pb-8 flex-1 overflow-auto grid grid-cols-3 gap-8 content-start">
        {/* Categories */}
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] mb-3 uppercase tracking-wide">
            Categorías ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Sin categorías"
              description="Crea tu primera categoría para organizar tus productos."
              action={
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
                  Crear categoría
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {[...categories].sort((a, b) => a.order - b.order).map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] hover:shadow-card transition-shadow group"
                  >
                    <GripVertical className="w-4 h-4 text-[hsl(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    {cat.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{cat.name}</p>
                      <p className="text-xs text-[hsl(var(--text-muted))]">
                        {productCountForCategory(cat.id)} producto{productCountForCategory(cat.id) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditTarget(cat); setFormOpen(true) }}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 rounded-lg text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))/8] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Genders + Types */}
        <div className="space-y-6">
          {/* Genders */}
          <div>
            <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] mb-3 uppercase tracking-wide">
              Géneros
            </h2>
            <div className="space-y-1 mb-3">
              {genders.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[hsl(var(--surface-overlay))] group">
                  <span className="text-sm text-[hsl(var(--text-primary))]">{g.name}</span>
                  <button
                    onClick={() => deleteGender(g.id)}
                    className="p-1 rounded text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo género..."
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGender.trim()) {
                    addGender(newGender.trim())
                    setNewGender('')
                  }
                }}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => { if (newGender.trim()) { addGender(newGender.trim()); setNewGender('') } }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Types */}
          <div>
            <h2 className="text-sm font-semibold text-[hsl(var(--text-secondary))] mb-3 uppercase tracking-wide">
              Tipos de producto
            </h2>
            <div className="space-y-1 mb-3">
              {types.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[hsl(var(--surface-overlay))] group">
                  <span className="text-sm text-[hsl(var(--text-primary))]">{t.name}</span>
                  <button
                    onClick={() => deleteType(t.id)}
                    className="p-1 rounded text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo tipo..."
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newType.trim()) {
                    addType(newType.trim())
                    setNewType('')
                  }
                }}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => { if (newType.trim()) { addType(newType.trim()); setNewType('') } }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CategoryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        category={editTarget}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteCategory(deleteId); setDeleteId(null) }}
        title="Eliminar categoría"
        description="Los productos de esta categoría quedarán sin categoría asignada."
      />
    </div>
  )
}
