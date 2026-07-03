'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { solicitarRecuperacion } from '@/lib/actions/auth'

export default function RecuperarPassword() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await solicitarRecuperacion(formData)
    },
    null
  )

  const enviado = state && 'success' in state && state.success

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Recuperar contraseña</h1>

        {enviado ? (
          <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700 text-sm text-center">
            {state && 'message' in state && state.message}
          </div>
        ) : (
          <>
            {state && 'message' in state && state.message && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                {state.message}
              </div>
            )}

            <form action={action} className="space-y-4">
              <p className="text-sm text-gray-600">
                Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full py-2 bg-green-700 text-white rounded text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
              >
                {pending ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-green-700 hover:underline font-medium">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
