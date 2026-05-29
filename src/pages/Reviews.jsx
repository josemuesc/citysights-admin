import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getReviews, deleteReview } from '../api/reviews'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

const PAGE_SIZE = 20

const TARGET_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'business', label: 'Negocios' },
  { value: 'service', label: 'Servicios' },
]

function Stars({ rating }) {
  return (
    <span className="text-amber-400 tracking-tight select-none" title={`${rating}/5`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function TruncatedComment({ text }) {
  if (!text) return <span className="text-gray-300 italic text-xs">Sin comentario</span>
  const short = text.length > 60 ? text.slice(0, 60) + '…' : text
  return (
    <span title={text} className="cursor-default">
      {short}
    </span>
  )
}

export default function Reviews() {
  const qc = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const queryKey = ['admin-reviews', { search, typeFilter, offset }]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getReviews({
        target_type: typeFilter || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    keepPreviousData: true,
  })

  const reviews = data?.data?.data ?? []
  const total = data?.data?.total ?? 0
  const hasNext = offset + PAGE_SIZE < total
  const hasPrev = offset > 0

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
    setOffset(0)
  }

  function handleTypeFilter(e) {
    setTypeFilter(e.target.value)
    setOffset(0)
  }

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Reseña eliminada')
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Error al eliminar la reseña'),
  })

  return (
    <>
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por negocio o usuario…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              if (!e.target.value) {
                setSearch('')
                setOffset(0)
              }
            }}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)]"
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>

        <select
          value={typeFilter}
          onChange={handleTypeFilter}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)]"
        >
          {TARGET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--green-dark)]">
            Reseñas
            {total > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({total} total)</span>
            )}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--green-dark)]">
                {['Negocio / Servicio', 'Usuario', 'Rating', 'Comentario', 'Fecha', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No hay reseñas registradas.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--cream)] transition-colors"
                  >
                    {/* Negocio / Servicio */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.target_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{r.target_type}</p>
                    </td>

                    {/* Usuario */}
                    <td className="px-4 py-3 text-gray-700">{r.full_name}</td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <Stars rating={r.rating ?? 0} />
                    </td>

                    {/* Comentario */}
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <TruncatedComment text={r.comment} />
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX') : '—'}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(r)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {total > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between text-sm text-gray-500">
            <span>
              {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!hasPrev}
                onClick={() => setOffset((o) => o - PAGE_SIZE)}
              >
                ← Anterior
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!hasNext}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar reseña"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Seguro que deseas eliminar la reseña de{' '}
          <span className="font-medium">{deleteTarget?.full_name}</span> sobre{' '}
          <span className="font-medium">{deleteTarget?.target_name}</span>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </>
  )
}
