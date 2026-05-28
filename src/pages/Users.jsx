import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/users'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'

export default function Users() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rol',
      render: (row) => (
        <Badge variant={row.role === 'admin' ? 'warning' : 'neutral'}>
          {row.role ?? 'user'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Registro',
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString('es-MX') : '—',
    },
  ]

  return (
    <Card title="Usuarios">
      <Table
        columns={columns}
        data={data?.data?.users ?? data?.data ?? []}
        loading={isLoading}
        emptyMessage="No hay usuarios registrados."
      />
    </Card>
  )
}
