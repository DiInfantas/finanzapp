import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  User,
  FolderTree,
  Landmark,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react'
import type { Section } from '../lib/finanz-data'

export interface NavItem {
  id: Section
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { id: 'categorias', label: 'Categorías', icon: FolderTree },
  { id: 'presupuestos', label: 'Presupuestos', icon: Landmark },
  { id: 'recurrentes', label: 'Recurrentes', icon: CalendarClock },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'perfil', label: 'Perfil', icon: User },
]
