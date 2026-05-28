import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login as loginApi } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: ({ data }) => {
      loginStore(data.token, data.user)
      navigate('/')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Credenciales incorrectas')
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--green-dark)]">CitySights</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] text-sm"
              {...register('email', { required: 'Requerido' })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] text-sm"
              {...register('password', { required: 'Requerido' })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Iniciar sesión
          </Button>
        </form>
      </div>
    </div>
  )
}
