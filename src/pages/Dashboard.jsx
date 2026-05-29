import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getStats } from '../api/businesses'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'

function StatCard({ label, value, icon, loading, bgColor, action }) {
  return (
    <div
      className="rounded-xl border border-[var(--border)] shadow-sm p-6 flex flex-col gap-3"
      style={{ background: bgColor || 'white' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <p
          className="text-3xl font-bold text-[var(--green-dark)]"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {value ?? '—'}
        </p>
      )}
      {action}
    </div>
  )
}

function RoleBar({ label, icon, count, total, color }) {
  const [width, setWidth] = useState(0)
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 50)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center text-base">{icon}</span>
      <span className="text-sm w-20 truncate text-gray-600">{label}</span>
      <div className="flex-1 h-3 rounded-full" style={{ background: '#E5E7EB' }}>
        <div
          className="h-3 rounded-full"
          style={{
            width: `${width}%`,
            background: color,
            transition: 'width 0.7s ease-out',
          }}
        />
      </div>
      <span className="text-sm font-semibold w-8 text-right text-gray-700">{count}</span>
      <span className="text-xs text-gray-400 w-12 text-right">({pct}%)</span>
    </div>
  )
}

const ROLE_CONFIG = [
  { key: 'tourist', label: 'Turistas', icon: '🧳', color: '#1976D2' },
  { key: 'local', label: 'Locales', icon: '🏘️', color: '#1B8A5A' },
  { key: 'business_owner', label: 'Dueños', icon: '🏪', color: '#F26522' },
]

const recentColumns = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría', hideOnMobile: true },
  {
    key: 'neighborhood',
    label: 'Barrio',
    hideOnMobile: true,
    render: (row) => row.neighborhood ?? <span className="text-gray-400">—</span>,
  },
  {
    key: 'is_verified',
    label: 'Verificado',
    render: (row) => (
      <Badge variant={row.is_verified ? 'green' : 'gray'}>
        {row.is_verified ? 'Sí' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    label: 'Fecha',
    hideOnMobile: true,
    render: (row) =>
      new Date(row.created_at).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const { data, isLoading, isError, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getStats().then((r) => r.data),
  })

  const minutesAgo =
    dataUpdatedAt != null ? Math.floor((Date.now() - dataUpdatedAt) / 60000) : null

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
        <p className="text-lg font-semibold">Error al cargar las estadísticas</p>
        <p className="text-sm">Verifica tu conexión o intenta más tarde.</p>
      </div>
    )
  }

  const usersByRole = data?.users_by_role ?? {}
  const totalUsers = data?.total_users ?? 0
  const pendingBusinesses = data?.pending_businesses ?? 0

  return (
    <div className="space-y-6">
      {/* Fila 1 — Stats de negocios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total negocios"
          value={data?.total_businesses}
          icon="🏪"
          loading={isLoading}
        />
        <StatCard
          label="Negocios verificados"
          value={data?.verified_businesses}
          icon="✓"
          loading={isLoading}
        />
        <StatCard
          label="Pendientes de verificar"
          value={pendingBusinesses}
          icon="⏳"
          loading={isLoading}
          bgColor={!isLoading && pendingBusinesses > 0 ? '#FEF9E6' : undefined}
          action={
            !isLoading && pendingBusinesses > 0 ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/businesses?verified=false')}
              >
                Ver pendientes
              </Button>
            ) : null
          }
        />
      </div>

      {/* Fila 2 — Usuarios por rol */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">👥</span>
          <div>
            <p className="text-sm text-gray-500">Total usuarios</p>
            {isLoading ? (
              <Spinner size="sm" className="mt-1" />
            ) : (
              <p
                className="text-3xl font-bold text-[var(--green-dark)]"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {totalUsers}
              </p>
            )}
          </div>
        </div>
        {!isLoading && (
          <div className="space-y-3">
            {ROLE_CONFIG.map(({ key, label, icon, color }) => (
              <RoleBar
                key={key}
                label={label}
                icon={icon}
                count={usersByRole[key] ?? 0}
                total={totalUsers}
                color={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fila 3 — Reseñas y rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total reseñas"
          value={data?.total_reviews}
          icon="⭐"
          loading={isLoading}
        />
        <StatCard
          label="Promedio rating general"
          value={data?.average_rating != null ? `${data.average_rating} ★` : null}
          icon="📊"
          loading={isLoading}
        />
      </div>

      {/* Timestamp y refresh */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>
          {minutesAgo === null
            ? 'Cargando...'
            : minutesAgo === 0
            ? 'Actualizado hace menos de un minuto'
            : minutesAgo === 1
            ? 'Actualizado hace 1 minuto'
            : `Actualizado hace ${minutesAgo} minutos`}
        </span>
        <button
          onClick={() => refetch()}
          className="ml-1 hover:text-gray-600 transition-colors"
          title="Actualizar estadísticas"
          aria-label="Actualizar estadísticas"
        >
          🔄
        </button>
      </div>

      {/* Gráfico negocios por categoría */}
      <Card title="Negocios por categoría">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data?.businesses_by_category ?? []}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                formatter={(val) => [val, 'Negocios']}
              />
              <Bar dataKey="count" fill="var(--green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Últimos negocios */}
      <Card
        title="Últimos negocios registrados"
        action={
          <Button size="sm" variant="secondary" onClick={() => navigate('/businesses')}>
            Ver todos
          </Button>
        }
      >
        <Table
          columns={recentColumns}
          data={data?.recent_businesses ?? []}
          loading={isLoading}
          emptyMessage="No hay negocios registrados aún."
        />
      </Card>
    </div>
  )
}
