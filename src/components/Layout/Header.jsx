import useAuthStore from '../../store/authStore'

export default function Header({ title, breadcrumb, onMenuOpen }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      style={{ height: 60, minHeight: 60 }}
      className="bg-white border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 shrink-0"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 1 ? (
            <nav className="flex items-center gap-1.5 text-sm min-w-0">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <span className="text-gray-300 shrink-0">/</span>}
                  <span
                    className={
                      i === breadcrumb.length - 1
                        ? 'font-semibold text-[var(--ink)] truncate'
                        : 'text-gray-400 hidden sm:inline'
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          ) : (
            <h1 className="text-base font-semibold text-[var(--ink)] truncate">{title}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500 hidden sm:block">
          {user?.email ?? 'Admin'}
        </span>
        <div className="w-8 h-8 rounded-full bg-[var(--green)] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {(user?.email?.[0] ?? 'A').toUpperCase()}
        </div>
      </div>
    </header>
  )
}
