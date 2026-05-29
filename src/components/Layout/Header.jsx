import useAuthStore from '../../store/authStore'

export default function Header({ title, breadcrumb }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      style={{ height: 60, minHeight: 60 }}
      className="bg-white border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0"
    >
      <div>
        {breadcrumb && breadcrumb.length > 1 ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300">/</span>}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? 'font-semibold text-[var(--ink)]'
                      : 'text-gray-400'
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-base font-semibold text-[var(--ink)]">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
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
