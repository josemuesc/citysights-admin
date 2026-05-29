export default function Badge({ children, variant = 'green', className = '' }) {
  const variants = {
    green: 'bg-[var(--green-light)] text-[var(--green-dark)]',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] ?? variants.green} ${className}`}
    >
      {children}
    </span>
  )
}
