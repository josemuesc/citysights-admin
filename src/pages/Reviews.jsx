import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getReviews, deleteReview } from '../api/reviews'
import Card from '../components/ui/Card'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function Reviews() {
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => getReviews(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success('Reseña eliminada')
      qc.invalidateQueries({ queryKey: ['reviews'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Error al eliminar'),
  })

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'business_name', label: 'Negocio' },
    { key: 'user_name', label: 'Usuario' },
    {
      key: 'rating',
      label: 'Calificación',
      render: (row) => `${'★'.repeat(row.rating ?? 0)}${'☆'.repeat(5 - (row.rating ?? 0))}`,
    },
    {
      key: 'comment',
      label: 'Comentario',
      render: (row) => (
        <span className="line-clamp-1 max-w-xs">{row.comment}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString('es-MX') : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
          Eliminar
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card title="Reseñas">
        <Table
          columns={columns}
          data={data?.data?.reviews ?? data?.data ?? []}
          loading={isLoading}
          emptyMessage="No hay reseñas registradas."
        />
      </Card>

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
          ¿Seguro que deseas eliminar esta reseña? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </>
  )
}
