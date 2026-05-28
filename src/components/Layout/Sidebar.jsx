import { NavLink } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/businesses', label: 'Negocios', icon: '🏢' },
  { to: '/users', label: 'Usuarios', icon: '👥' },
  { to: '/reviews', label: 'Reseñas', icon: '⭐' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="w-60 min-h-screen bg-[var(--green-dark)] flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-tight">CitySights</span>
        <span className="text-white/50 text-xs ml-1">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>→</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
