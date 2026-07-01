import { useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Wallet,
  Sparkles,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { api } from '../api'

interface AuthScreenProps {
  onAuth: (user: any) => void
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        const response = await api.post('auth/registro/', {
          nombre: name,
          correo: email,
          password,
        })
        const { access, refresh, usuario } = response.data
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        onAuth(usuario)
      } else {
        const response = await api.post('auth/login/', {
          correo: email,
          password,
        })
        const { access, refresh, usuario } = response.data
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        onAuth(usuario)
      }
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.detail ||
        err.response?.data?.correo?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        'Error al procesar la solicitud. Verifique sus datos.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setError('')
    setLoading(true)

    try {
      const response = await api.post('auth/login/', {
        correo: 'demo@finanzapp.local',
        password: 'demo12345',
      })
      const { access, refresh, usuario } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      onAuth(usuario)
    } catch (err: any) {
      console.error(err)
      setError(
        'El servidor demo no está disponible o la cuenta aún no ha sido creada.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 size-[30rem] rounded-full bg-chart-4/20 blur-[130px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wallet className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            FinanzApp
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Tu dinero, claro y bajo control.
          </p>
        </div>

        <div className="glass rounded-3xl border border-border/60 p-6 shadow-2xl shadow-black/20 sm:p-8">
          {/* Toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setError('')
                }}
                className={cn(
                  'rounded-lg py-2 text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/20 text-destructive text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <Field
                icon={User}
                label="Nombre completo"
                type="text"
                placeholder="Diego Infantas"
                value={name}
                onChange={setName}
                autoFocus
              />
            )}
            <Field
              icon={Mail}
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={setEmail}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/90">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pr-11 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Crear cuenta' : 'Entrar'}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4 flex items-center justify-center">
            <hr className="w-full border-border/60" />
            <span className="absolute bg-card px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              O probar la app
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="size-4 text-primary animate-pulse" />
                Acceder como Demo
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? 'login' : 'register')
                setError('')
              }}
              className="font-semibold text-primary transition-opacity hover:opacity-80"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  icon: typeof Mail
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/90">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-input bg-background/50 py-2.5 pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  )
}
