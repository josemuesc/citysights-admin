import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getBusinesses, deleteBusiness } from '../api/businesses'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function Businesses() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => getBusinesses(),
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

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'category', label: 'Categoría' },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'neutral'}>
          {row.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    { key: 'city', label: 'Ciudad' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/businesses/${row.id}/edit`)}
          >
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Card
        title="Negocios"
        action={
          <Button onClick={() => navigate('/businesses/new')}>+ Nuevo negocio</Button>
        }
      >
        <Table
          columns={columns}
          data={data?.data?.businesses ?? data?.data ?? []}
          loading={isLoading}
          emptyMessage="No hay negocios registrados."
        />
      </Card>

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
