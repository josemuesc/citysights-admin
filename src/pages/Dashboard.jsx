import { useQuery } from '@tanstack/react-query'
import { getBusinesses } from '../api/businesses'
import { getUsers } from '../api/users'
import { getReviews } from '../api/reviews'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function StatCard({ label, value, loading }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <Spinner size="sm" className="mt-2" />
      ) : (
        <p className="text-3xl font-bold text-[var(--green-dark)] mt-1">{value ?? '—'}</p>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const { data: businesses, isLoading: bLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => getBusinesses({ limit: 100 }),
  })

  const { data: users, isLoading: uLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers({ limit: 100 }),
  })

  const { data: reviews, isLoading: rLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews({ limit: 100 }),
  })

  const chartData = [
    { name: 'Negocios', total: businesses?.data?.total ?? 0 },
    { name: 'Usuarios', total: users?.data?.total ?? 0 },
    { name: 'Reseñas', total: reviews?.data?.total ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Negocios" value={businesses?.data?.total} loading={bLoading} />
        <StatCard label="Usuarios" value={users?.data?.total} loading={uLoading} />
        <StatCard label="Reseñas" value={reviews?.data?.total} loading={rLoading} />
      </div>

      <Card title="Resumen">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="total" fill="var(--green)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
