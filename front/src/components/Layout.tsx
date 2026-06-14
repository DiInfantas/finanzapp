import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowUpDown, FolderTree, LogOut, User } from 'lucide-react';

export default function Layout() {
  const token = localStorage.getItem('access_token');
  const location = useLocation();
  const navigate = useNavigate();
  const userString = localStorage.getItem('usuario');
  const user = userString ? JSON.parse(userString) : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transacciones', label: 'Transacciones', icon: ArrowUpDown },
    { path: '/categorias', label: 'Categorías', icon: FolderTree },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-wider text-indigo-400">FINANZAPP</h1>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile / Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{user.correo}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">
            {navItems.find((i) => i.path === location.pathname)?.label || 'Finanzas'}
          </h2>
          <div className="text-xs text-slate-400">
            Local Time: {new Date().toLocaleDateString()}
          </div>
        </header>
        <div className="p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
