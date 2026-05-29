import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getBusinesses,
  deleteBusiness,
  verifyBusiness,
  featureBusiness,
  getCategories,
} from '../api/businesses'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

const PAGE_SIZE = 20

export default function Businesses() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('')
  const [offset, setOffset] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })
  const categories = catData?.data?.data ?? catData?.data ?? []

  const queryKey = ['businesses', { search, category, offset }]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getBusinesses({
        search: search || undefined,
        category: category || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    keepPreviousData: true,
  })

  const businesses = data?.data?.data ?? []
  const total = data?.data?.total ?? 0
  const hasNext = offset + PAGE_SIZE < total
  const hasPrev = offset > 0

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
    setOffset(0)
  }

  function handleCategory(e) {
    setCategory(e.target.value)
    setOffset(0)
  }

  const verifyMutation = useMutation({
    mutationFn: (id) => verifyBusiness(id),
    onSuccess: (_, id) => {
      toast.success('Negocio verificado')
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old
        const list = old.data?.data ?? []
        return {
          ...old,
          data: {
            ...old.data,
            data: list.map((b) => (b.id === id ? { ...b, is_verified: true } : b)),
          },
        }
      })
    },
    onError: () => toast.error('Error al verificar'),
  })

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => featureBusiness(id, featured),
    onSuccess: (_, { id, featured }) => {
      toast.success(featured ? 'Negocio destacado' : 'Negocio quitado de destacados')
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old
        const list = old.data?.data ?? []
        return {
          ...old,
          data: {
            ...old.data,
            data: list.map((b) => (b.id === id ? { ...b, is_featured: featured } : b)),
          },
        }
      })
    },
    onError: () => toast.error('Error al actualizar destacado'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      toast.success('Negocio eliminado')
      qc.invalidateQueries({ queryKey: ['businesses'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Error al eliminar'),
  })

  return (
    <>
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar negocio..."
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

        <div className="flex gap-2 items-center">
          <select
            value={category}
            onChange={handleCategory}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <Button onClick={() => navigate('/businesses/new')}>
            + Nuevo negocio
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--green-dark)]">
            Negocios
            {total > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({total} total)</span>
            )}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--green-dark)]">
                {['Imagen', 'Nombre', 'Categoría', 'Verificado', 'Destacado', 'Reseñas', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No hay negocios registrados.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--cream)] transition-colors"
                  >
                    {/* Imagen */}
                    <td className="px-4 py-3">
                      {b.images?.[0] ? (
                        <img
                          src={b.images[0]}
                          alt={b.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          —
                        </div>
                      )}
                    </td>

                    {/* Nombre + barrio */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{b.name}</p>
                      {b.neighborhood && (
                        <p className="text-xs text-gray-400">{b.neighborhood}</p>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3">
                      <Badge variant="gray">{b.category?.name || '—'}</Badge>
                    </td>

                    {/* Verificado — toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (!b.is_verified) verifyMutation.mutate(b.id)
                        }}
                        disabled={b.is_verified || verifyMutation.isPending}
                        title={b.is_verified ? 'Ya verificado' : 'Marcar como verificado'}
                        className="disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Badge variant={b.is_verified ? 'green' : 'gray'}>
                          {b.is_verified ? 'Verificado' : 'Sin verificar'}
                        </Badge>
                      </button>
                    </td>

                    {/* Destacado — toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          featureMutation.mutate({ id: b.id, featured: !b.is_featured })
                        }
                        disabled={featureMutation.isPending}
                        title={b.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                        className="disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Badge variant={b.is_featured ? 'orange' : 'gray'}>
                          {b.is_featured ? 'Destacado' : 'Normal'}
                        </Badge>
                      </button>
                    </td>

                    {/* Reseñas */}
                    <td className="px-4 py-3 text-gray-600">{b.total_reviews ?? 0}</td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/businesses/${b.slug}/edit`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(b)}
                        >
                          Eliminar
                        </Button>
                      </div>
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar negocio"
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
          ¿Seguro que deseas eliminar <strong>{deleteTarget?.name}</strong>? Esta acción no
          se puede deshacer.
        </p>
      </Modal>
    </>
  )
}
