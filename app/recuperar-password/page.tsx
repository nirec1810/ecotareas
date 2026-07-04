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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-dark-carbon text-center mb-6">Recuperar contraseña</h1>

          {enviado ? (
            <div className="p-4 rounded bg-eco-green/10 border border-eco-green/30 text-forest-green text-sm text-center">
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
                <p className="text-sm text-medium-gray">
                  Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark-carbon mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
                >
                  {pending ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-medium-gray">
          <Link href="/login" className="text-forest-green hover:text-[#14532d] font-medium">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
