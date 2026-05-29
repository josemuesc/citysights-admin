import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole, toggleUserActive } from '../api/users'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const PAGE_SIZE = 20

const ROLES = [
  { value: '', label: 'Todos los roles' },
  { value: 'tourist', label: 'Tourist' },
  { value: 'local', label: 'Local' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_BADGE = {
  admin: 'orange',
  business_owner: 'green',
  service_provider: 'green',
  local: 'gray',
  tourist: 'gray',
}

const ROLE_COLORS = {
  admin: 'bg-orange-400',
  business_owner: 'bg-emerald-500',
  service_provider: 'bg-teal-500',
  local: 'bg-blue-400',
  tourist: 'bg-gray-400',
}

function Avatar({ name }) {
  const initial = (name ?? '?')[0].toUpperCase()
  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  ]
  const color = colors[initial.charCodeAt(0) % colors.length]
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm select-none ${color}`}
    >
      {initial}
    </div>
  )
}

export default function Users() {
  const qc = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [offset, setOffset] = useState(0)

  const queryKey = ['admin-users', { search, roleFilter, offset }]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    keepPreviousData: true,
  })

  const users = data?.data?.data ?? []
  const total = data?.data?.total ?? 0
  const hasNext = offset + PAGE_SIZE < total
  const hasPrev = offset > 0

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
    setOffset(0)
  }

  function handleRoleFilter(e) {
    setRoleFilter(e.target.value)
    setOffset(0)
  }

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: (res, { id }) => {
      toast.success('Rol actualizado')
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((u) =>
              u.id === id ? { ...u, role: res.data.role } : u
            ),
          },
        }
      })
    },
    onError: () => toast.error('Error al actualizar el rol'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleUserActive(id),
    onSuccess: (res, id) => {
      const next = res.data.is_active
      toast.success(next ? 'Usuario activado' : 'Usuario desactivado')
      qc.setQueryData(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((u) =>
              u.id === id ? { ...u, is_active: next } : u
            ),
          },
        }
      })
    },
    onError: () => toast.error('Error al cambiar el estado'),
  })

  return (
    <>
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
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
          value={roleFilter}
          onChange={handleRoleFilter}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)]"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--green-dark)]">
            Usuarios
            {total > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({total} total)</span>
            )}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--green-dark)]">
                {['Avatar', 'Nombre / Email', 'Rol', 'Estado', 'Registro', 'Cambiar rol'].map((h) => (
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--cream)] transition-colors"
                  >
                    {/* Avatar */}
                    <td className="px-4 py-3">
                      <Avatar name={u.full_name} />
                    </td>

                    {/* Nombre + email */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{u.full_name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE[u.role] ?? 'gray'}>
                        {u.role}
                      </Badge>
                    </td>

                    {/* Estado toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(u.id)}
                        disabled={toggleMutation.isPending}
                        title={u.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Badge variant={u.is_active ? 'green' : 'red'}>
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </button>
                    </td>

                    {/* Fecha de registro */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('es-MX')
                        : '—'}
                    </td>

                    {/* Cambiar rol */}
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={roleMutation.isPending}
                        onChange={(e) =>
                          roleMutation.mutate({ id: u.id, role: e.target.value })
                        }
                        className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green-dark)] disabled:opacity-50"
                      >
                        {ROLES.filter((r) => r.value).map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
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
    </>
  )
}
