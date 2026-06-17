import { useState, useEffect } from 'react'
import { Plus, Trash2, CalendarClock, Loader2 } from 'lucide-react'
import { api } from '../api'
import { formatCurrency } from '../lib/finanz-data'

interface RecurringExpense {
  id: number
  monto: string
  frecuencia: string
  categoria_nombre: string
  categoria: number
  descripcion: string
}

interface ApiCategory {
  id: number
  nombre: string
  tipo: 'ingreso' | 'gasto' | 'ambos'
}

export function RecurringView() {
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  
  // Form states
  const [selectedCat, setSelectedCat] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('mensual')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [catsRes, recurRes] = await Promise.all([
        api.get('categorias/'),
        api.get('gastos-recurrentes/'),
      ])
      setCategories(catsRes.data.filter((c: any) => c.tipo !== 'ingreso'))
      setRecurringList(recurRes.data)
      if (catsRes.data.length > 0) {
        const firstExpenseCat = catsRes.data.find((c: any) => c.tipo !== 'ingreso')
        if (firstExpenseCat) setSelectedCat(firstExpenseCat.id)
      }
    } catch (err) {
      console.error(err)
      setError('Error al obtener datos de gastos recurrentes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCat || !amount) return

    try {
      const response = await api.post('gastos-recurrentes/', {
        categoria: Number(selectedCat),
        monto: parseFloat(amount),
        frecuencia: frequency,
        descripcion: description.trim() || 'Sin descripción',
      })
      setRecurringList((prev) => [...prev, response.data])
      setAmount('')
      setDescription('')
    } catch (err) {
      setError('Error al crear el gasto recurrente.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este gasto recurrente?')) return
    try {
      await api.delete(`gastos-recurrentes/${id}/`)
      setRecurringList((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError('Error al intentar eliminar el gasto recurrente.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gastos Recurrentes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura gastos que se repiten con frecuencia (Netflix, arriendos, gimnasio, etc.).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Nuevo Gasto Recurrente */}
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-sm md:col-span-1 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="size-5 text-primary" />
                <h2 className="text-base font-semibold">Configurar Recurrente</h2>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Descripción</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej. Suscripción Netflix"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Monto</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej. 10000"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Frecuencia</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Plus className="size-4" /> Registrar Gasto
                </button>
              </form>
            </div>

            {/* Listado de Gastos Recurrentes */}
            <div className="md:col-span-2">
              <section className="rounded-2xl border border-border bg-card shadow-sm p-6">
                <h2 className="text-base font-semibold mb-4 font-heading">Gastos Recurrentes Activos</h2>
                <div className="flex flex-col gap-4">
                  {recurringList.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 border border-border bg-muted/20 rounded-xl">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{r.descripcion}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Categoría: <span className="text-foreground">{r.categoria_nombre}</span> · Frecuencia: <span className="text-foreground uppercase font-bold text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.frecuencia}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-destructive">
                          -{formatCurrency(parseFloat(r.monto))}
                        </span>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {recurringList.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border">
                      Aún no has configurado gastos recurrentes.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
