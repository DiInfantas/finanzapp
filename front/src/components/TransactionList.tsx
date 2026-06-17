import { Trash2, Pencil } from 'lucide-react'
import { cn } from '../lib/utils'
import {
  formatCurrency,
  formatDate,
  getCategory,
  type Transaction,
} from '../lib/finanz-data'

interface TransactionListProps {
  transactions: Transaction[]
  title?: string
  emptyHint?: string
  onDelete?: (id: string | number, type: 'ingreso' | 'gasto') => void
  onEdit?: (tx: Transaction) => void
}

export function TransactionList({
  transactions,
  title = 'Transacciones recientes',
  emptyHint = 'Aún no hay movimientos registrados.',
  onDelete,
  onEdit,
}: TransactionListProps) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {transactions.length} movimientos
        </span>
      </header>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((tx) => {
            const cat = getCategory(tx.category)
            const Icon = cat.icon
            const isIncome = tx.type === 'ingreso'
            return (
              <li
                key={`${tx.type}-${tx.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    isIncome
                      ? 'bg-success/15 text-success'
                      : 'bg-accent text-accent-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cat.label} · {formatDate(tx.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums mr-2',
                      isIncome ? 'text-success' : 'text-foreground',
                    )}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-muted-foreground transition-colors hover:text-primary rounded-lg hover:bg-primary/10"
                      aria-label="Editar movimiento"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(tx.id, tx.type)}
                      className="p-1.5 text-muted-foreground transition-colors hover:text-destructive rounded-lg hover:bg-destructive/10"
                      aria-label="Eliminar movimiento"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
