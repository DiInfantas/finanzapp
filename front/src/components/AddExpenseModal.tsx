import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '../lib/utils'
import type { TxType } from '../lib/finanz-data'

interface ApiCategory {
  id: number
  nombre: string
  tipo: 'ingreso' | 'gasto' | 'ambos'
}

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onAdd: (tx: {
    description: string
    category: number
    amount: number
    type: TxType
    date: string
  }) => void
  categoriesList: ApiCategory[]
}

const today = new Date().toISOString().slice(0, 10)

export function AddExpenseModal({ open, onClose, onAdd, categoriesList }: AddExpenseModalProps) {
  const [type, setType] = useState<TxType>('gasto')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string | number>('')
  const [date, setDate] = useState(today)
  const [description, setDescription] = useState('')

  const filteredCategories = categoriesList.filter((c) => {
    if (type === 'ingreso') return c.tipo === 'ingreso' || c.tipo === 'ambos';
    return c.tipo === 'gasto' || c.tipo === 'ambos';
  })

  // Set default category whenever type or categoriesList changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory(filteredCategories[0].id)
    } else {
      setCategory('')
    }
  }, [type, categoriesList])

  useEffect(() => {
    if (open) {
      setType('gasto')
      setAmount('')
      setDate(today)
      setDescription('')
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number.parseFloat(amount)
    if (!value || value <= 0 || !category) return
    onAdd({
      description: description.trim() || 'Sin descripción',
      category: Number(category),
      amount: value,
      type,
      date,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar movimiento"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-2xl duration-200 animate-in slide-in-from-bottom-4 sm:rounded-3xl sm:fade-in-0 sm:zoom-in-95"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Agregar movimiento</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
            {(['gasto', 'ingreso'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                }}
                className={cn(
                  'rounded-lg py-2 text-sm font-medium capitalize transition-all',
                  type === t
                    ? t === 'ingreso'
                      ? 'bg-success text-success-foreground shadow-sm'
                      : 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className="text-sm font-medium">
              Monto
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                required
                className="w-full rounded-xl border border-input bg-background/50 py-2.5 pr-3 pl-7 text-lg font-semibold outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {filteredCategories.length === 0 && (
                <option value="">No hay categorías creadas</option>
              )}
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className="text-sm font-medium">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Almuerzo familiar"
              className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Check className="size-4" />
            Guardar movimiento
          </button>
        </form>
      </div>
    </div>
  )
}
