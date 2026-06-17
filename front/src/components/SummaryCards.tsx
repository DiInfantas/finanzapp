import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { cn } from '../lib/utils'
import { formatCurrency } from '../lib/finanz-data'

interface SummaryCardsProps {
  balance: number
  ingresos: number
  gastos: number
}

export function SummaryCards({ balance, ingresos, gastos }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Balance — featured card */}
      <article className="group relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5">
        <div
          aria-hidden
          className="absolute -top-10 -right-10 size-32 rounded-full bg-primary-foreground/10 blur-xl"
        />
        <div className="relative flex items-center justify-between">
          <span className="text-sm font-medium text-primary-foreground/80">
            Balance Total
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Wallet className="size-4" />
          </span>
        </div>
        <p className="relative mt-4 text-3xl font-semibold tracking-tight">
          {formatCurrency(balance)}
        </p>
        <p className="relative mt-1 text-xs text-primary-foreground/70">
          Disponible este mes
        </p>
      </article>

      <StatCard
        label="Ingresos"
        value={ingresos}
        icon={ArrowUpRight}
        tone="success"
      />
      <StatCard
        label="Gastos"
        value={gastos}
        icon={ArrowDownRight}
        tone="destructive"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof ArrowUpRight
  tone: 'success' | 'destructive'
}) {
  const toneClasses =
    tone === 'success'
      ? 'bg-success/15 text-success'
      : 'bg-destructive/15 text-destructive'

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
            toneClasses,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          'mt-4 text-3xl font-semibold tracking-tight',
          tone === 'success' ? 'text-success' : 'text-destructive',
        )}
      >
        {tone === 'destructive' ? '-' : '+'}
        {formatCurrency(value)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Acumulado del mes</p>
    </article>
  )
}
