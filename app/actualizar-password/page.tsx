'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { actualizarPassword } from '@/lib/actions/auth'

export default function ActualizarPassword() {
  const [listo, setListo] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code && !hash) {
      setError('Enlace inválido o expirado')
      return
    }

    async function handleRecovery() {
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError('Error al verificar el enlace: ' + error.message)
          return
        }
      } else if (hash) {
        const hashParams = new URLSearchParams(hash.replace('#', ''))
        const accessToken = hashParams.get('access_token')
        if (!accessToken) {
          setError('Enlace inválido')
          return
        }
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        })
        if (error) {
          setError('Error al verificar el enlace: ' + error.message)
          return
        }
      }

      setListo(true)
    }

    handleRecovery()
  }, [])

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await actualizarPassword(formData)
    },
    null
  )

  const errors = state && 'errors' in state ? (state as { errors: Record<string, string[] | undefined> }).errors : {}

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {error}
            </div>
            <a href="/login" className="text-forest-green hover:text-[#14532d] text-sm font-medium">
              Volver a iniciar sesión
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!listo) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <p className="text-medium-gray">Verificando enlace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-dark-carbon text-center mb-6">Nueva contraseña</h1>

          {state && 'message' in state && state.message && !('errors' in state) && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-carbon mb-1">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 border rounded text-sm ${errors?.password ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
              />
              {errors?.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmar_password" className="block text-sm font-medium text-dark-carbon mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmar_password"
                name="confirmar_password"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 border rounded text-sm ${errors?.confirmar_password ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
              />
              {errors?.confirmar_password && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmar_password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
            >
              {pending ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
