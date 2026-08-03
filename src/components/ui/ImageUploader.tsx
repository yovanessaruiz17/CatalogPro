import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn, compressImage } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploaderProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
  hint?: string
}

export function ImageUploader({ value, onChange, label, hint }: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setIsCompressing(true)
      try {
        const compressed = await compressImage(file, 800, 0.85)
        onChange(compressed)
      } finally {
        setIsCompressing(false)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  })

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</span>
      )}

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--surface-overlay))]"
            style={{ aspectRatio: '4/3' }}
          >
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
              'transition-colors duration-150 cursor-pointer',
              'border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-subtle))]',
              isDragActive && 'border-[hsl(var(--accent))] bg-[hsl(var(--accent-subtle))]',
              'py-10'
            )}
          >
            <input {...getInputProps()} />
            {isCompressing ? (
              <div className="animate-spin-slow">
                <ImageIcon className="w-8 h-8 text-[hsl(var(--text-muted))]" />
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--surface-overlay))] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[hsl(var(--text-muted))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                  {isDragActive ? 'Suelta aquí' : 'Arrastra una imagen'}
                </p>
                <p className="text-xs text-[hsl(var(--text-muted))]">
                  JPG, PNG, WebP • Máx 10MB
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hint && <p className="text-xs text-[hsl(var(--text-muted))]">{hint}</p>}
    </div>
  )
}
