import useAuthStore from '../../store/authStore'

export default function Header({ title }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-14 bg-white border-b border-[var(--border)] flex items-center justify-between px-6">
      <h1 className="font-semibold text-[var(--ink)]">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email ?? 'Admin'}</span>
        <div className="w-8 h-8 rounded-full bg-[var(--green)] text-white text-xs font-bold flex items-center justify-center">
          {(user?.email?.[0] ?? 'A').toUpperCase()}
        </div>
      </div>
    </header>
  )
}
