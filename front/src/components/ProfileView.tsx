import { useState } from 'react'
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Sun,
  X,
  Mail,
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
  const [activeModal, setActiveModal] = useState<'privacy' | 'support' | 'notifications' | null>(null)

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
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50 cursor-pointer"
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
          { icon: Bell, label: 'Notificaciones', id: 'notifications' as const },
          { icon: Shield, label: 'Privacidad y seguridad', id: 'privacy' as const },
          { icon: HelpCircle, label: 'Ayuda y soporte', id: 'support' as const },
        ].map(({ icon: Icon, label, id }) => (
          <div key={label} className="w-full">
            <button
              type="button"
              onClick={() => setActiveModal(id)}
              className="flex w-full items-center gap-3 border-t border-border px-5 py-4 text-left transition-colors hover:bg-muted/50 cursor-pointer"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={onLogout}
        className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/15 cursor-pointer"
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>

      {/* Info Modals */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl duration-300 animate-in fade-in-0 zoom-in-95"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {activeModal === 'notifications' && 'Notificaciones'}
                {activeModal === 'privacy' && 'Privacidad y Seguridad'}
                {activeModal === 'support' && 'Ayuda y Soporte'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              {activeModal === 'notifications' && (
                <div>
                  <p>
                    Las notificaciones y alertas automáticas te ayudarán a controlar tus presupuestos y recordar tus gastos recurrentes a tiempo.
                  </p>
                  <p className="mt-3 font-semibold text-primary">
                    🛠️ Esta sección se encuentra actualmente en construcción y estará disponible próximamente.
                  </p>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-3">
                  <p>
                    En <strong>FinanzApp</strong>, tu privacidad es nuestra prioridad:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Tus registros financieros se almacenan de manera privada y encriptada en la base de datos.</li>
                    <li>No compartimos tu información personal ni de transacciones con ningún tercero.</li>
                    <li>Tienes control total sobre tus datos en todo momento.</li>
                  </ul>
                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-xs mb-2 text-muted-foreground/80">
                      Si deseas borrar toda tu información y registros permanentemente de nuestro sistema, puedes hacerlo utilizando el botón de abajo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Todos tus ingresos, gastos y presupuestos registrados se borrarán de forma definitiva y esta acción no se puede deshacer.'
                          )
                        ) {
                          setActiveModal(null)
                          onLogout()
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
                    >
                      Eliminar cuenta y datos
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'support' && (
                <div className="space-y-3">
                  <p>
                    <strong>FinanzApp</strong> se encuentra actualmente en un proceso continuo de desarrollo y mejoras para brindarte la mejor experiencia de gestión financiera.
                  </p>
                  <p>
                    Si tienes sugerencias de nuevas características, has encontrado un error o necesitas soporte técnico, no dudes en ponerte en contacto.
                  </p>
                  <div className="pt-2">
                    <a
                      href="mailto:diego.infantasp@gmail.com?subject=Soporte/Sugerencia FinanzApp"
                      className="flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 w-full cursor-pointer"
                    >
                      <Mail className="size-4" />
                      diego.infantasp@gmail.com
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:scale-98 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
