import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  getBusinessById,
  createBusiness,
  updateBusiness,
  uploadImages,
  getCategories,
  featureBusiness,
  verifyBusiness,
} from '../api/businesses'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const DAYS = [
  { key: 'monday',    apiKey: 'lun', label: 'Lun' },
  { key: 'tuesday',   apiKey: 'mar', label: 'Mar' },
  { key: 'wednesday', apiKey: 'mie', label: 'Mié' },
  { key: 'thursday',  apiKey: 'jue', label: 'Jue' },
  { key: 'friday',    apiKey: 'vie', label: 'Vie' },
  { key: 'saturday',  apiKey: 'sab', label: 'Sáb' },
  { key: 'sunday',    apiKey: 'dom', label: 'Dom' },
]

const DEFAULT_HOURS = DAYS.reduce(
  (acc, { key }) => ({ ...acc, [key]: { active: false, open: '09:00', close: '18:00' } }),
  {}
)

function parseHoursToForm(hours) {
  return DAYS.reduce((acc, { key, apiKey }) => {
    const val = hours?.[apiKey]
    if (!val || val === 'closed') {
      acc[key] = { active: false, open: '09:00', close: '18:00' }
    } else if (typeof val === 'string' && val.includes('-')) {
      const [open, close] = val.split('-')
      acc[key] = { active: true, open: open.trim(), close: close.trim() }
    } else if (val && typeof val === 'object') {
      acc[key] = { active: true, open: val.open ?? '09:00', close: val.close ?? '18:00' }
    } else {
      acc[key] = { active: false, open: '09:00', close: '18:00' }
    }
    return acc
  }, {})
}

function buildHoursPayload(hoursForm) {
  return DAYS.reduce((acc, { key, apiKey }) => {
    const day = hoursForm?.[key]
    acc[apiKey] = day?.active ? `${day.open}-${day.close}` : 'closed'
    return acc
  }, {})
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ink)] mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-[var(--green-dark)] uppercase tracking-wider pb-2 border-b border-[var(--border)]">
        {title}
      </h3>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--green)] text-sm'

const errInputCls =
  'w-full px-3 py-2 rounded-lg border border-red-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm'

export default function BusinessForm() {
  const { id: slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [isGeocoding, setIsGeocoding] = useState(false)

  // ── Categories ─────────────────────────────────────────────────────────────
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })
  const categories = catData?.data?.data ?? catData?.data ?? []

  // ── Business (edit mode) ───────────────────────────────────────────────────
  // `select` normalizes the axios response into the raw business object,
  // regardless of whether the API wraps it in { data: {...} } or not.
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => getBusinessById(slug),
    enabled: isEdit,
    staleTime: 0,
    select: (res) => {
      const body = res.data
      // Handle { data: {...} } and flat {...} API shapes
      return body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? body.data
        : body
    },
  })

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hours: DEFAULT_HOURS,
      is_verified: false,
      is_featured: false,
      is_active: true,
    },
  })

  const watchedHours = watch('hours')

  // Populate form when editing
  useEffect(() => {
    if (!business) return
    setExistingImages(business.images ?? [])
    reset({
      name: business.name ?? '',
      category_id: business.category?.id ?? business.category_id ?? '',
      description: business.description ?? '',
      tags: Array.isArray(business.tags)
        ? business.tags.join(', ')
        : (business.tags ?? ''),
      address: business.address ?? '',
      neighborhood: business.neighborhood ?? '',
      latitude: business.lat ?? '',
      longitude: business.lng ?? '',
      phone: business.phone ?? '',
      whatsapp: business.whatsapp ?? '',
      email: business.email ?? '',
      website: business.website ?? '',
      hours: parseHoursToForm(business.schedule),
      is_verified: business.is_verified ?? false,
      is_featured: business.is_featured ?? false,
      is_active: business.is_active ?? true,
    })
  }, [business, reset])

  // ── Dropzone ───────────────────────────────────────────────────────────────
  const totalImages = existingImages.length + newImages.length
  const slotsLeft = 5 - totalImages

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    disabled: slotsLeft <= 0,
    onDrop: (accepted) => {
      setNewImages((prev) => {
        const available = 5 - existingImages.length - prev.length
        if (available <= 0) return prev
        return [...prev, ...accepted.slice(0, available)]
      })
    },
  })

  // ── Geocoding (Nominatim / OpenStreetMap) ──────────────────────────────────
  async function geocodeAddress() {
    const address = watch('address')?.trim()
    const neighborhood = watch('neighborhood')?.trim()
    if (!address) {
      toast.error('Ingresa una dirección primero')
      return
    }
    const q = [address, neighborhood].filter(Boolean).join(', ')
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: 'json', limit: '1' })}`,
        { headers: { 'User-Agent': 'CitySights-Admin/1.0' } }
      )
      if (!res.ok) throw new Error()
      const results = await res.json()
      if (results.length > 0) {
        setValue('latitude', parseFloat(results[0].lat).toFixed(6), { shouldDirty: true })
        setValue('longitude', parseFloat(results[0].lon).toFixed(6), { shouldDirty: true })
        toast.success('Coordenadas encontradas')
      } else {
        toast.error('No se encontraron coordenadas para esa dirección')
      }
    } catch {
      toast.error('Error al buscar coordenadas')
    } finally {
      setIsGeocoding(false)
    }
  }

  // ── Save mutation ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        address: values.address || undefined,
        neighborhood: values.neighborhood || undefined,
        lat: values.latitude ? parseFloat(values.latitude) : undefined,
        lng: values.longitude ? parseFloat(values.longitude) : undefined,
        phone: values.phone || undefined,
        whatsapp: values.whatsapp || undefined,
        email: values.email || undefined,
        website: values.website || undefined,
        schedule: buildHoursPayload(values.hours),
      }
      const res = isEdit
        ? await updateBusiness(business.id, payload)
        : await createBusiness(payload)
      const bizId = res.data?.data?.id ?? res.data?.id ?? business?.id

      if (newImages.length > 0) {
        await uploadImages(bizId, newImages)
      }

      // is_featured y is_verified se manejan por endpoints admin separados
      if (isEdit) {
        if (values.is_featured !== business.is_featured) {
          await featureBusiness(business.id, values.is_featured)
        }
        if (values.is_verified && !business.is_verified) {
          await verifyBusiness(business.id)
        }
      }

      return res
    },
    onSuccess: () => {
      toast.success('Negocio guardado')
      qc.invalidateQueries({ queryKey: ['businesses'] })
      navigate('/businesses')
    },
    onError: () => toast.error('Error al guardar'),
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isEdit && isLoading && !business) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <h1 className="text-xl font-semibold text-[var(--ink)]">
        {isEdit ? 'Editar negocio' : 'Nuevo negocio'}
      </h1>

      <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">

        {/* ── Información básica ── */}
        <Card>
          <Section title="Información básica">
            <Field label="Nombre *" error={errors.name?.message}>
              <input
                className={errors.name ? errInputCls : inputCls}
                placeholder="Nombre del negocio"
                {...register('name', { required: 'El nombre es requerido' })}
              />
            </Field>

            <Field label="Categoría *" error={errors.category_id?.message}>
              <select
                className={errors.category_id ? errInputCls : inputCls}
                {...register('category_id', { required: 'Selecciona una categoría' })}
              >
                <option value="">— Seleccionar categoría —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Descripción *" error={errors.description?.message}>
              <textarea
                rows={4}
                className={errors.description ? errInputCls : inputCls}
                placeholder="Describe el negocio..."
                {...register('description', { required: 'La descripción es requerida' })}
              />
            </Field>

            <Field
              label="Tags"
              hint="Separados por comas  ej: café, wifi, terraza"
            >
              <input
                className={inputCls}
                placeholder="café, wifi, terraza"
                {...register('tags')}
              />
            </Field>
          </Section>
        </Card>

        {/* ── Ubicación ── */}
        <Card>
          <Section title="Ubicación">
            <Field label="Dirección *" error={errors.address?.message}>
              <input
                className={errors.address ? errInputCls : inputCls}
                placeholder="Calle 123 # 45-67"
                {...register('address', { required: 'La dirección es requerida' })}
              />
            </Field>

            <Field label="Barrio">
              <input
                className={inputCls}
                placeholder="Nombre del barrio"
                {...register('neighborhood')}
              />
            </Field>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Escribe la dirección y el barrio, luego haz clic en el botón para obtener
                las coordenadas automáticamente.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={isGeocoding}
                onClick={geocodeAddress}
                className="ml-4 shrink-0"
              >
                Obtener coordenadas
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitud" error={errors.latitude?.message}>
                <input
                  type="number"
                  step="any"
                  className={inputCls}
                  placeholder="4.6097"
                  {...register('latitude')}
                />
              </Field>
              <Field label="Longitud" error={errors.longitude?.message}>
                <input
                  type="number"
                  step="any"
                  className={inputCls}
                  placeholder="-74.0817"
                  {...register('longitude')}
                />
              </Field>
            </div>
          </Section>
        </Card>

        {/* ── Contacto ── */}
        <Card>
          <Section title="Contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teléfono">
                <input
                  className={inputCls}
                  placeholder="+57 300 000 0000"
                  {...register('phone')}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  className={inputCls}
                  placeholder="+57 300 000 0000"
                  {...register('whatsapp')}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className={inputCls}
                  placeholder="contacto@negocio.com"
                  {...register('email')}
                />
              </Field>
              <Field label="Sitio web">
                <input
                  className={inputCls}
                  placeholder="https://negocio.com"
                  {...register('website')}
                />
              </Field>
            </div>
          </Section>
        </Card>

        {/* ── Horario ── */}
        <Card>
          <Section title="Horario">
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const dayActive = watchedHours?.[key]?.active
                return (
                  <div key={key} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-20 shrink-0 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[var(--green)]"
                        {...register(`hours.${key}.active`)}
                      />
                      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
                    </label>

                    <input
                      type="time"
                      className={`px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green)] w-32 transition-opacity ${
                        !dayActive ? 'opacity-40' : ''
                      }`}
                      disabled={!dayActive}
                      {...register(`hours.${key}.open`)}
                    />

                    <span className="text-gray-400 text-sm shrink-0">–</span>

                    <input
                      type="time"
                      className={`px-3 py-2 rounded-lg border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green)] w-32 transition-opacity ${
                        !dayActive ? 'opacity-40' : ''
                      }`}
                      disabled={!dayActive}
                      {...register(`hours.${key}.close`)}
                    />

                    {!dayActive && (
                      <span className="text-xs text-gray-400">Cerrado</span>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        </Card>

        {/* ── Imágenes ── */}
        <Card>
          <Section title="Imágenes">
            {totalImages > 0 && (
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, i) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExistingImages((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {newImages.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg border-2 border-dashed border-[var(--green)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewImages((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {slotsLeft > 0 && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-[var(--green)] bg-[var(--green-light)]'
                    : 'border-[var(--border)] hover:border-[var(--green)] hover:bg-[var(--green-light)]'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-gray-500">
                  {isDragActive
                    ? 'Suelta las imágenes aquí...'
                    : 'Arrastra imágenes o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {slotsLeft} imagen{slotsLeft !== 1 ? 'es' : ''} disponible{slotsLeft !== 1 ? 's' : ''} · PNG, JPG, WEBP
                </p>
              </div>
            )}
          </Section>
        </Card>

        {/* ── Estado ── */}
        <Card>
          <Section title="Estado">
            <div className="space-y-4">
              {/* Verificado — solo ida, no se puede revertir */}
              {(() => {
                const on = watch('is_verified')
                const alreadyVerified = isEdit && business?.is_verified
                return (
                  <div className="flex items-center justify-between py-0.5">
                    <div>
                      <span className="text-sm text-[var(--ink)]">Verificado</span>
                      {alreadyVerified && (
                        <p className="text-xs text-gray-400 mt-0.5">No se puede revertir</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => !alreadyVerified && setValue('is_verified', !on)}
                      aria-pressed={!!on}
                      disabled={alreadyVerified}
                      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                        on ? 'bg-[var(--green)]' : 'bg-gray-300'
                      } ${alreadyVerified ? 'opacity-60 cursor-default' : 'focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-1'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          on ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })()}

              {/* Destacado — toggle completo */}
              {(() => {
                const on = watch('is_featured')
                return (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-[var(--ink)]">Destacado</span>
                    <button
                      type="button"
                      onClick={() => setValue('is_featured', !on)}
                      aria-pressed={!!on}
                      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-1 ${
                        on ? 'bg-[var(--green)]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          on ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })()}
            </div>
          </Section>
        </Card>

        {/* ── Acciones ── */}
        <div className="flex gap-3">
          <Button type="submit" loading={saveMutation.isPending}>
            Guardar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/businesses')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
