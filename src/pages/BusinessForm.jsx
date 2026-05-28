import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getBusiness, createBusiness, updateBusiness } from '../api/businesses'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] text-sm'

export default function BusinessForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: () => getBusiness(id),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (data?.data) reset(data.data)
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: (values) => (isEdit ? updateBusiness(id, values) : createBusiness(values)),
    onSuccess: () => {
      toast.success(isEdit ? 'Negocio actualizado' : 'Negocio creado')
      qc.invalidateQueries({ queryKey: ['businesses'] })
      navigate('/businesses')
    },
    onError: () => toast.error('Error al guardar'),
  })

  if (isEdit && isLoading) return <div className="p-6">Cargando...</div>

  return (
    <Card title={isEdit ? 'Editar negocio' : 'Nuevo negocio'}>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 max-w-lg">
        <Field label="Nombre" error={errors.name?.message}>
          <input className={inputCls} {...register('name', { required: 'Requerido' })} />
        </Field>

        <Field label="Descripción" error={errors.description?.message}>
          <textarea
            rows={3}
            className={inputCls}
            {...register('description')}
          />
        </Field>

        <Field label="Categoría" error={errors.category?.message}>
          <input className={inputCls} {...register('category', { required: 'Requerido' })} />
        </Field>

        <Field label="Ciudad" error={errors.city?.message}>
          <input className={inputCls} {...register('city', { required: 'Requerido' })} />
        </Field>

        <Field label="Dirección" error={errors.address?.message}>
          <input className={inputCls} {...register('address')} />
        </Field>

        <Field label="Teléfono" error={errors.phone?.message}>
          <input className={inputCls} {...register('phone')} />
        </Field>

        <Field label="Sitio web" error={errors.website?.message}>
          <input type="url" className={inputCls} {...register('website')} />
        </Field>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? 'Guardar cambios' : 'Crear negocio'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/businesses')}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
