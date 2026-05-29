import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/businesses', label: 'Negocios', icon: '🏪' },
  { to: '/users', label: 'Usuarios', icon: '👥' },
  { to: '/reviews', label: 'Reseñas', icon: '⭐' },
]

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        style={{ width: 240, minWidth: 240 }}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-[var(--green-dark)] transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <span className="text-[var(--green-light)]">
            <PinIcon />
          </span>
          <div className="leading-tight">
            <span className="text-white font-bold text-base tracking-tight">CitySights</span>
            <span className="text-white/40 text-xs ml-1.5">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border-l-[3px] ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border-l-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white border-l-transparent'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-white/40 text-xs mb-0.5">Administrador</p>
            <p className="text-white/80 text-sm truncate">{user?.email ?? 'admin@citysights.app'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
