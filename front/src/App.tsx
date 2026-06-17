import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import Dashboard from './components/Dashboard'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check local storage for existing session
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('usuario')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    // Toggle dark mode class on document element
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function handleAuth(authenticatedUser: any) {
    setUser(authenticatedUser)
    setAuthed(true)
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('usuario')
    setAuthed(false)
    setUser(null)
  }

  return (
    <div
      key={authed ? 'app' : 'auth'}
      className="duration-500 animate-in fade-in-0 min-h-dvh bg-background text-foreground"
    >
      {authed ? (
        <Dashboard
          userName={user?.nombre || 'Usuario'}
          userEmail={user?.correo}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          onLogout={handleLogout}
        />
      ) : (
        <AuthScreen onAuth={handleAuth} />
      )}
    </div>
  )
}
