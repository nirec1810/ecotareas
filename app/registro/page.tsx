'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registrarUsuario } from '@/lib/actions/auth'

export default function Registro() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await registrarUsuario(formData)
    },
    null
  )

  const errors = state && 'errors' in state ? (state as { errors: Record<string, string[] | undefined> }).errors : {}

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-dark-carbon text-center mb-6">Crear cuenta</h1>

          {state && 'message' in state && state.message && !('errors' in state) && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-dark-carbon mb-1">
                Nombre completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                className={`w-full px-3 py-2 border rounded text-sm ${errors?.full_name ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
              />
              {errors?.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-carbon mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded text-sm ${errors?.email ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
              />
              {errors?.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-carbon mb-1">
                Contraseña
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
                Confirmar contraseña
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
              {pending ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-medium-gray">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-forest-green hover:text-[#14532d] font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
