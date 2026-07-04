'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { iniciarSesion } from '@/lib/actions/auth'

export default function Login() {
  const searchParams = useSearchParams()

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await iniciarSesion(formData)
    },
    null
  )

  const errors = state && 'errors' in state ? (state as { errors: Record<string, string[] | undefined> }).errors : {}
  const recuperado = searchParams.get('recuperado') === '1'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-dark-carbon text-center mb-6">Iniciar sesión</h1>

          {recuperado && (
            <div className="mb-4 p-3 rounded bg-eco-green/10 border border-eco-green/30 text-forest-green text-sm">
              Contraseña actualizada correctamente. Iniciá sesión con tu nueva contraseña.
            </div>
          )}

          {state && 'message' in state && state.message && !('errors' in state) && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-4">
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
                autoComplete="current-password"
                className={`w-full px-3 py-2 border rounded text-sm ${errors?.password ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
              />
              {errors?.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
              )}
            </div>

            <div className="text-right">
              <Link href="/recuperar-password" className="text-xs text-forest-green hover:text-[#14532d] font-medium">
                Olvidé mi contraseña
              </Link>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
            >
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-medium-gray">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-forest-green hover:text-[#14532d] font-medium">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
