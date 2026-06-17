import { TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'
import {
  formatCurrency,
  getCategory,
  type Transaction,
} from '../lib/finanz-data'

interface ReportsViewProps {
  transactions: Transaction[]
}

export function ReportsView({ transactions }: ReportsViewProps) {
  // Spending by category
  const byCategory = new Map<string | number, number>()
  for (const tx of transactions) {
    if (tx.type !== 'gasto') continue
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount)
  }
  const rows = [...byCategory.entries()]
    .map(([id, total]) => ({ cat: getCategory(id), total }))
    .sort((a, b) => b.total - a.total)
  const maxTotal = Math.max(1, ...rows.map((r) => r.total))
  const totalGastos = rows.reduce((s, r) => s + r.total, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Análisis de tus gastos por categoría.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <TrendingUp className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Gastos por categoría</h2>
              <p className="text-xs text-muted-foreground">
                Total: {formatCurrency(totalGastos)}
              </p>
            </div>
          </div>
        </header>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay gastos registrados todavía.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map(({ cat, total }, i) => {
              const Icon = cat.icon
              const pct = Math.round((total / maxTotal) * 100)
              const share = Math.round((total / totalGastos) * 100)
              return (
                <li key={cat.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-muted-foreground" />
                      {cat.label}
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(total)}{' '}
                      <span className="text-xs text-muted-foreground">
                        ({share}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        i === 0 ? 'bg-primary' : 'bg-chart-4/80',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
