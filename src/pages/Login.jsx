import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login as loginApi } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'

function PinLogo() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 0C8.059 0 0 8.059 0 18c0 9.941 18 26 18 26S36 27.941 36 18C36 8.059 27.941 0 18 0z"
        fill="var(--orange)"
      />
      <circle cx="18" cy="18" r="7" fill="white" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: ({ data }) => {
      if (data.user?.role !== 'admin') {
        setErrorMsg('No tienes permisos de administrador')
        return
      }
      loginStore(data.access_token, data.user)
      navigate('/')
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message ?? 'Credenciales incorrectas')
    },
  })

  const onSubmit = (values) => {
    setErrorMsg('')
    mutation.mutate(values)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--cream)' }}>
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: '2.5rem 2rem',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <PinLogo />
            </div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--green-dark)',
              lineHeight: 1.1,
            }}>
              CitySights
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 6 }}>
              Panel de Administración
            </p>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: 8,
              padding: '0.625rem 0.875rem',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@ejemplo.com"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  border: `1px solid ${errors.email ? '#f87171' : 'var(--border)'}`,
                  fontSize: '0.875rem',
                  color: 'var(--ink)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { if (!errors.email) e.target.style.borderColor = 'var(--green)' }}
                onBlur={(e) => { if (!errors.email) e.target.style.borderColor = 'var(--border)' }}
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Formato de email inválido',
                  },
                })}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                    borderRadius: 8,
                    border: `1px solid ${errors.password ? '#f87171' : 'var(--border)'}`,
                    fontSize: '0.875rem',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = 'var(--green)' }}
                  onBlur={(e) => { if (!errors.password) e.target.style.borderColor = 'var(--border)' }}
                  {...register('password', { required: 'La contraseña es requerida' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    right: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4 }}>{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" style={{ marginTop: 4 }} loading={mutation.isPending}>
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
