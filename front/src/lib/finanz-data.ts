import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Car,
  Film,
  Heart,
  HelpCircle,
  Home,
  PiggyBank,
  ShoppingCart,
  Utensils,
  Zap,
} from 'lucide-react'

export type TxType = 'ingreso' | 'gasto'

export interface Transaction {
  id: string | number
  description: string
  category: string
  amount: number
  type: TxType
  date: string // ISO yyyy-mm-dd
}

export interface Category {
  id: string | number
  label: string
  icon: LucideIcon
  type: TxType | 'ambos'
}

export const categories: Category[] = [
  { id: 'comida', label: 'Comida', icon: Utensils, type: 'gasto' },
  { id: 'compras', label: 'Compras', icon: ShoppingCart, type: 'gasto' },
  { id: 'transporte', label: 'Transporte', icon: Car, type: 'gasto' },
  { id: 'hogar', label: 'Hogar', icon: Home, type: 'gasto' },
  { id: 'servicios', label: 'Servicios', icon: Zap, type: 'gasto' },
  { id: 'ocio', label: 'Ocio', icon: Film, type: 'gasto' },
  { id: 'salud', label: 'Salud', icon: Heart, type: 'gasto' },
  { id: 'salario', label: 'Salario', icon: Briefcase, type: 'ingreso' },
  { id: 'ahorro', label: 'Ahorro', icon: PiggyBank, type: 'ingreso' },
  { id: 'otros', label: 'Otros', icon: HelpCircle, type: 'gasto' },
]

export function getCategory(idOrName: string | number): Category {
  const normalized = String(idOrName).toLowerCase();
  const found = categories.find((c) => String(c.id) === normalized || c.label.toLowerCase() === normalized)
  return found ?? { id: 'otros', label: String(idOrName), icon: HelpCircle, type: 'gasto' }
}

const currencyFmt = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return currencyFmt.format(value)
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  // Evitar desfasamiento de zona horaria usando split
  const parts = iso.split('-')
  if (parts.length === 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
    })
  }
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
  })
}

export function computeTotals(transactions: Transaction[]) {
  const ingresos = transactions
    .filter((t) => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0)
  const gastos = transactions
    .filter((t) => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0)
  return { ingresos, gastos, balance: ingresos - gastos }
}

export type Section = 'inicio' | 'transacciones' | 'categorias' | 'presupuestos' | 'recurrentes' | 'reportes' | 'perfil'
