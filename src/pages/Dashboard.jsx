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

function StatCard({ label, value, icon, loading }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {loading ? (
          <Spinner size="sm" className="mt-2" />
        ) : (
          <p className="text-3xl font-bold text-[var(--green-dark)] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
            {value ?? '—'}
          </p>
        )}
      </div>
    </div>
  )
}

const recentColumns = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría' },
  {
    key: 'neighborhood',
    label: 'Barrio',
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getStats().then((r) => r.data),
  })

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
        <p className="text-lg font-semibold">Error al cargar las estadísticas</p>
        <p className="text-sm">Verifica tu conexión o intenta más tarde.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total negocios" value={data?.total_businesses} icon="🏪" loading={isLoading} />
        <StatCard label="Negocios verificados" value={data?.verified_businesses} icon="✓" loading={isLoading} />
        <StatCard label="Total usuarios" value={data?.total_users} icon="👥" loading={isLoading} />
        <StatCard label="Total reseñas" value={data?.total_reviews} icon="⭐" loading={isLoading} />
      </div>

      <Card title="Negocios por categoría">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.businesses_by_category ?? []} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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

      <Card
        title="Últimos negocios registrados"
        action={<Button size="sm" variant="secondary" onClick={() => navigate('/businesses')}>Ver todos</Button>}
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
