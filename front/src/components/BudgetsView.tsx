import { useState, useEffect } from 'react'
import { Plus, Trash2, Landmark, Loader2 } from 'lucide-react'
import { api } from '../api'
import { formatCurrency } from '../lib/finanz-data'

interface Budget {
  id: number
  categoria: number
  categoria_nombre: string
  monto: string
  periodo: string // e.g. "2025-06"
}

interface ApiCategory {
  id: number
  nombre: string
  tipo: 'ingreso' | 'gasto' | 'ambos'
}

interface Expense {
  monto: string
  categoria: number
}

export function BudgetsView() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  // Form states
  const [selectedCat, setSelectedCat] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7)) // yyyy-mm

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [catsRes, budgetsRes, expensesRes] = await Promise.all([
        api.get('categorias/'),
        api.get('presupuestos/'),
        api.get('gastos/'),
      ])
      setCategories(catsRes.data.filter((c: any) => c.tipo !== 'ingreso'))
      setBudgets(budgetsRes.data)
      setExpenses(expensesRes.data)
      if (catsRes.data.length > 0) {
        const firstExpenseCat = catsRes.data.find((c: any) => c.tipo !== 'ingreso')
        if (firstExpenseCat) setSelectedCat(firstExpenseCat.id)
      }
    } catch (err) {
      console.error(err)
      setError('Error al obtener datos de presupuestos.')
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
      const response = await api.post('presupuestos/', {
        categoria: Number(selectedCat),
        monto: parseFloat(amount),
        periodo: period + '-01',
      })
      setBudgets((prev) => [...prev, response.data])
      setAmount('')
    } catch (err) {
      setError('Error al definir el presupuesto.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este presupuesto?')) return
    try {
      await api.delete(`presupuestos/${id}/`)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError('Error al intentar eliminar el presupuesto.')
    }
  }

  // Calculate spent amount by category
  const getSpentAmount = (catId: number) => {
    return expenses
      .filter((e) => e.categoria === catId)
      .reduce((sum, e) => sum + parseFloat(e.monto), 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Presupuestos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define límites de gasto por categoría para planificar tus finanzas.
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
            {/* Nuevo Presupuesto */}
            <div className="glass rounded-3xl border border-border/60 p-6 shadow-sm md:col-span-1 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="size-5 text-primary" />
                <h2 className="text-base font-semibold">Definir Presupuesto</h2>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <label className="text-sm font-medium">Monto Límite</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej. 100000"
                    required
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Período (Mes/Año)</label>
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Plus className="size-4" /> Definir Límite
                </button>
              </form>
            </div>

            {/* Listado y Progreso de Presupuestos */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <section className="rounded-2xl border border-border bg-card shadow-sm p-6">
                <h2 className="text-base font-semibold mb-4">Progreso Mensual</h2>
                <div className="flex flex-col gap-6">
                  {budgets.map((b) => {
                    const spent = getSpentAmount(b.categoria)
                    const limit = parseFloat(b.monto)
                    const pct = Math.min(100, Math.round((spent / limit) * 100))
                    const isOver = spent > limit
                    const balance = limit - spent

                    return (
                      <div key={b.id} className="flex flex-col gap-2 p-4 border border-border bg-muted/20 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-semibold text-foreground">{b.categoria_nombre}</span>
                            <span className="text-xs text-muted-foreground ml-2">({b.periodo ? b.periodo.slice(0, 7) : ''})</span>
                          </div>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 overflow-hidden rounded-full bg-muted mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isOver ? 'bg-destructive' : pct > 85 ? 'bg-yellow-500' : 'bg-primary'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-muted-foreground">
                            Gastado: <span className="font-semibold text-foreground">{formatCurrency(spent)}</span> de <span className="font-semibold text-foreground">{formatCurrency(limit)}</span>
                          </span>
                          <span className={isOver ? 'text-destructive font-semibold' : 'text-success font-medium'}>
                            {isOver ? `Excedido por ${formatCurrency(Math.abs(balance))}` : `Disponible: ${formatCurrency(balance)}`} ({pct}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {budgets.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border">
                      Aún no has definido límites de presupuesto para este período.
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
