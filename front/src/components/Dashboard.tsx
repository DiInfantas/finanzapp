import { useMemo, useState, useEffect } from 'react'
import { Bell, LogOut, Moon, Plus, Search, Sun, Wallet, FolderTree, Landmark, CalendarClock, User } from 'lucide-react'
import { cn } from '../lib/utils'
import {
  computeTotals,
  type Section,
  type Transaction,
  type TxType,
} from '../lib/finanz-data'
import { navItems } from './nav-items'
import { SummaryCards } from './SummaryCards'
import { TransactionList } from './TransactionList'
import { AddExpenseModal } from './AddExpenseModal'
import { ReportsView } from './ReportsView'
import { ProfileView } from './ProfileView'
import { CategoriesView } from './CategoriesView'
import { BudgetsView } from './BudgetsView'
import { RecurringView } from './RecurringView'
import { api } from '../api'
import { ConfirmModal } from './ConfirmModal'

interface DashboardProps {
  userName: string
  userEmail?: string
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
}

const sectionTitles: Record<Section, string> = {
  inicio: 'Inicio',
  transacciones: 'Transacciones',
  categorias: 'Categorías',
  presupuestos: 'Presupuestos',
  recurrentes: 'Recurrentes',
  reportes: 'Reportes',
  perfil: 'Perfil',
}

interface ApiCategory {
  id: number
  nombre: string
  tipo: 'ingreso' | 'gasto' | 'ambos'
}

export default function Dashboard({
  userName,
  userEmail,
  isDark,
  onToggleTheme,
  onLogout,
}: DashboardProps) {
  const [section, setSection] = useState<Section>('inicio')
  const [modalOpen, setModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoriesList, setCategoriesList] = useState<ApiCategory[]>([])
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([])
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean
    title: string
    message: string
    confirmText?: string
    type?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [catsRes, subsRes, incomesRes, expensesRes] = await Promise.all([
        api.get('categorias/'),
        api.get('subcategorias/'),
        api.get('ingresos/'),
        api.get('gastos/'),
      ])

      setCategoriesList(catsRes.data)
      setSubcategoriesList(subsRes.data)

      const mappedIncomes = incomesRes.data.map((item: any) => {
        const cat = catsRes.data.find((c: any) => c.id === item.categoria)
        return {
          id: item.id,
          description: item.descripcion || 'Sin descripción',
          category: cat ? cat.nombre : 'Sueldo',
          amount: parseFloat(item.monto),
          type: 'ingreso' as TxType,
          date: item.fecha,
        }
      })

      const mappedExpenses = expensesRes.data.map((item: any) => {
        const cat = catsRes.data.find((c: any) => c.id === item.categoria)
        const sub = subsRes.data.find((s: any) => s.id === item.subcategoria)
        return {
          id: item.id,
          description: item.descripcion || 'Sin descripción',
          category: cat ? cat.nombre : 'Otros',
          subcategory_nombre: sub ? sub.nombre : undefined,
          subcategory_id: item.subcategoria,
          amount: parseFloat(item.monto),
          type: 'gasto' as TxType,
          date: item.fecha,
        }
      })

      setTransactions([...mappedIncomes, ...mappedExpenses])
    } catch (err) {
      console.error('Error al cargar datos financieros:', err)
      setError('No se pudieron obtener los datos del servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [section, modalOpen])

  const totals = useMemo(() => computeTotals(transactions), [transactions])

  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted
    const q = query.toLowerCase()
    return sorted.filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }, [sorted, query])

  function handleOpenEditModal(tx: any) {
    setEditingTransaction(tx)
    setModalOpen(true)
  }

  async function handleAddTransaction(tx: {
    description: string
    category: number
    subcategory?: number | null
    amount: number
    type: TxType
    date: string
  }, id?: string | number) {
    try {
      const isEditMode = !!id
      const endpoint = tx.type === 'ingreso' ? 'ingresos/' : 'gastos/'
      const payload: any = {
        monto: tx.amount,
        categoria: tx.category,
        descripcion: tx.description,
        fecha: tx.date,
      }

      if (tx.type === 'gasto') {
        payload.subcategoria = tx.subcategory
      }

      if (isEditMode) {
        await api.put(`${endpoint}${id}/`, payload)
      } else {
        await api.post(endpoint, payload)
      }
      
      setEditingTransaction(null)
      fetchData()
    } catch (err) {
      console.error('Error al guardar movimiento:', err)
      alert('Error al guardar el movimiento en el servidor.')
    }
  }

  async function handleDeleteTransaction(id: string | number, type: 'ingreso' | 'gasto') {
    setConfirmConfig({
      open: true,
      title: 'Eliminar movimiento',
      message: '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      type: 'danger',
      onConfirm: async () => {
        try {
          const endpoint = type === 'ingreso' ? 'ingresos' : 'gastos'
          await api.delete(`${endpoint}/${id}/`)
          setTransactions((prev) => prev.filter((t) => !(t.id === id && t.type === type)))
        } catch (err) {
          console.error('Error al eliminar movimiento:', err)
          alert('No se pudo eliminar el movimiento.')
        }
      }
    })
  }

  function handleConfirmLogout() {
    setConfirmConfig({
      open: true,
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a ingresar tus credenciales.',
      confirmText: 'Cerrar sesión',
      type: 'danger',
      onConfirm: onLogout,
    })
  }

  const firstName = userName.split(' ')[0]

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex w-full">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
          <div className="flex items-center gap-2.5 px-2 py-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              FinanzApp
            </span>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
          >
            <LogOut className="size-5" />
            Cerrar sesión
          </button>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="size-4" />
              </span>
              <span className="font-semibold">FinanzApp</span>
            </div>

            <h1 className="hidden text-lg font-semibold lg:block">
              {sectionTitles[section]}
            </h1>

            {/* Search (desktop) */}
            <div className="relative ml-auto hidden max-w-xs flex-1 lg:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar transacciones..."
                className="w-full rounded-xl border border-input bg-card py-2 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Cambiar tema"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                {isDark ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </button>
              
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen)
                    setProfileDropdownOpen(false)
                  }}
                  aria-label="Notificaciones"
                  className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Bell className="size-4" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
                </button>

                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-1 text-center">
                      <p className="text-sm font-semibold text-foreground">Notificaciones</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Por el momento no tienes notificaciones.
                      </p>
                      <span className="inline-block mt-3 text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                        En construcción 🛠️
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen)
                    setNotificationsOpen(false)
                  }}
                  className="ml-1 flex size-9 cursor-pointer items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {firstName[0]?.toUpperCase() || 'U'}
                </button>

                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSection('perfil')
                          setProfileDropdownOpen(false)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/85 transition-colors text-left"
                      >
                        <User className="size-4" />
                        Mi Perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleConfirmLogout()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut className="size-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:pb-10">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Cargando información financiera...</p>
            ) : (
              <>
                {section === 'inicio' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          ¡Hola de nuevo,
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight text-balance">
                          {userName}! 👋
                        </h2>
                      </div>
                      
                      {/* PC add transaction button */}
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                      >
                        <Plus className="size-4" />
                        Agregar movimiento
                      </button>
                    </div>
                    <SummaryCards
                      balance={totals.balance}
                      ingresos={totals.ingresos}
                      gastos={totals.gastos}
                    />

                    {/* Quick Actions Grid */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-3">Accesos Rápidos</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => setSection('categorias')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left transition-all hover:bg-muted/50 hover:shadow-sm"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FolderTree className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Categorías</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Organiza tus movimientos</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSection('presupuestos')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left transition-all hover:bg-muted/50 hover:shadow-sm"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                            <Landmark className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Presupuestos</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Límites de gasto mensual</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSection('recurrentes')}
                          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left transition-all hover:bg-muted/50 hover:shadow-sm"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <CalendarClock className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold">Recurrentes</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Gestiona tus suscripciones</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <TransactionList
                      transactions={sorted.slice(0, 6)}
                      onDelete={handleDeleteTransaction}
                      onEdit={handleOpenEditModal}
                    />
                  </div>
                )}

                {section === 'transacciones' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300 flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Transacciones
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Todos tus movimientos en un solo lugar.
                      </p>
                    </div>
                    <div className="relative lg:hidden">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar transacciones..."
                        className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <TransactionList
                      transactions={filtered}
                      title="Historial completo"
                      emptyHint="No se encontraron transacciones."
                      onDelete={handleDeleteTransaction}
                      onEdit={handleOpenEditModal}
                    />
                  </div>
                )}

                {section === 'categorias' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                    <CategoriesView />
                  </div>
                )}

                {section === 'presupuestos' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                    <BudgetsView />
                  </div>
                )}

                {section === 'recurrentes' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                    <RecurringView />
                  </div>
                )}

                {section === 'reportes' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                    <ReportsView transactions={transactions} />
                  </div>
                )}

                {section === 'perfil' && (
                  <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
                    <ProfileView
                      userName={userName}
                      userEmail={userEmail}
                      isDark={isDark}
                      onToggleTheme={onToggleTheme}
                      onLogout={handleConfirmLogout}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background/90 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 py-1.5">
          {navItems.filter((item) => item.id === 'inicio' || item.id === 'transacciones').map((item) => (
            <BottomNavButton
              key={item.id}
              item={item}
              active={section === item.id}
              onClick={() => setSection(item.id)}
            />
          ))}

          {/* Floating action button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Agregar gasto"
              className="-mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background transition-transform active:scale-90"
            >
              <Plus className="size-6" />
            </button>
          </div>

          {navItems.filter((item) => item.id === 'reportes' || item.id === 'perfil').map((item) => (
            <BottomNavButton
              key={item.id}
              item={item}
              active={section === item.id}
              onClick={() => setSection(item.id)}
            />
          ))}
        </div>
      </nav>

      {/* Desktop quick-add FAB - hidden completely as requested to use inline top button on PC */}
      <div className="hidden"></div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTransaction(null)
        }}
        onAdd={handleAddTransaction}
        categoriesList={categoriesList}
        subcategoriesList={subcategoriesList}
        editingTransaction={editingTransaction}
      />

      <ConfirmModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}

function BottomNavButton({
  item,
  active,
  onClick,
}: {
  item: (typeof navItems)[number]
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <Icon className={cn('size-5', active && 'scale-110')} />
      {item.label}
    </button>
  )
}
