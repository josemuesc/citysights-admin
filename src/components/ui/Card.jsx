export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-white rounded-xl border border-[var(--border)] shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          {title && <h3 className="font-semibold text-[var(--ink)]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
