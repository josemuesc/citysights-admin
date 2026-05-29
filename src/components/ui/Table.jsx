import Spinner from './Spinner'

export default function Table({ columns, data, loading, emptyMessage = 'No hay datos.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--green-dark)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider whitespace-nowrap${col.hideOnMobile ? ' hide-mobile' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Spinner className="mx-auto" />
              </td>
            </tr>
          ) : data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data?.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-t border-[var(--border)] hover:bg-[var(--cream)] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3${col.hideOnMobile ? ' hide-mobile' : ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
