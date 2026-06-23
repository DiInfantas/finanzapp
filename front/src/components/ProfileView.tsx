import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Sun,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface ProfileViewProps {
  userName: string
  userEmail?: string
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
}

export function ProfileView({
  userName,
  userEmail = 'usuario@finanzapp.com',
  isDark,
  onToggleTheme,
  onLogout,
}: ProfileViewProps) {
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu cuenta y preferencias.
        </p>
      </div>

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
          {initials || 'U'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{userName || 'Usuario'}</p>
          <p className="truncate text-sm text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </span>
          <span className="flex-1 text-sm font-medium">
            {isDark ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
          <span
            className={cn(
              'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors',
              isDark ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'size-5 rounded-full bg-card shadow-sm transition-transform',
                isDark && 'translate-x-5',
              )}
            />
          </span>
        </button>

        {[
          { icon: Bell, label: 'Notificaciones' },
          { icon: Shield, label: 'Privacidad y seguridad' },
          { icon: HelpCircle, label: 'Ayuda y soporte' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="group relative w-full">
            <button
              type="button"
              className="flex w-full items-center gap-3 border-t border-border px-5 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 bg-card text-foreground border border-border text-xs px-2.5 py-1 rounded-lg shadow-sm font-medium z-10">
              En construcción 🛠️
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={onLogout}
        className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </div>
  )
}
