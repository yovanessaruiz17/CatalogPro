import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/ui/ImageUploader'
import type { Product } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  code: z.string().min(1, 'Código requerido'),
  price: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
  image: z.string().nullable(),
  categoryId: z.string().nullable(),
  genderId: z.string().nullable(),
  typeId: z.string().nullable(),
  description: z.string(),
  status: z.enum(['active', 'inactive', 'draft']),
})

type FormValues = z.infer<typeof schema>

interface ProductFormProps {
  open: boolean
  onClose: () => void
  product?: Product | null
}

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const { addProduct, updateProduct, categories, genders, types } = useStore()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      price: 0,
      image: null,
      categoryId: null,
      genderId: null,
      typeId: null,
      description: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        code: product.code,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId ?? null,
        genderId: product.genderId ?? null,
        typeId: product.typeId ?? null,
        description: product.description,
        status: product.status,
      })
    } else {
      reset()
    }
  }, [product, reset, open])

  const onSubmit = (values: FormValues) => {
    if (product) {
      updateProduct(product.id, {
        ...values,
        additionalImages: product.additionalImages,
      })
    } else {
      addProduct({ ...values, additionalImages: [] })
    }
    onClose()
  }

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  const genderOptions = [
    { value: '', label: 'Sin género' },
    ...genders.map((g) => ({ value: g.id, label: g.name })),
  ]

  const typeOptions = [
    { value: '', label: 'Sin tipo' },
    ...types.map((t) => ({ value: t.id, label: t.name })),
  ]

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'draft', label: 'Borrador' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Image */}
          <div className="col-span-2">
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  label="Imagen principal"
                />
              )}
            />
          </div>

          {/* Name */}
          <div className="col-span-2">
            <Input
              label="Nombre *"
              placeholder="Ej: Camisa de lino blanca"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* Code */}
          <Input
            label="Código *"
            placeholder="SKU-001"
            error={errors.code?.message}
            {...register('code')}
          />

          {/* Price */}
          <Input
            label="Precio *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            {...register('price')}
          />

          {/* Category */}
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="Categoría"
                options={categoryOptions}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />

          {/* Gender */}
          <Controller
            name="genderId"
            control={control}
            render={({ field }) => (
              <Select
                label="Género"
                options={genderOptions}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />

          {/* Type */}
          <Controller
            name="typeId"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo"
                options={typeOptions}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
              />
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Estado"
                options={statusOptions}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />

          {/* Description */}
          <div className="col-span-2">
            <Textarea
              label="Descripción"
              rows={3}
              placeholder="Descripción del producto..."
              {...register('description')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {product ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
