'use client'

import { useState } from 'react'
import { activarDesactivarUsuario } from '@/lib/actions/users'
import { useRouter } from 'next/navigation'
import type { VoluntarioConEmail } from '@/lib/types'

interface Props {
  voluntarios: VoluntarioConEmail[]
}

export default function ListaVoluntarios({ voluntarios }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState<string | null>(null)
  const router = useRouter()

  const filtrados = voluntarios.filter((v) => {
    const termino = busqueda.toLowerCase()
    return (
      v.full_name.toLowerCase().includes(termino) ||
      v.email.toLowerCase().includes(termino)
    )
  })

  const handleToggle = async (userId: string, estadoActual: boolean) => {
    setCargando(userId)
    await activarDesactivarUsuario(userId, !estadoActual)
    setCargando(null)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wide">Correo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wide">Puntos</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-medium-gray uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-dark-carbon font-medium">{v.full_name}</td>
                  <td className="px-4 py-3 text-medium-gray">{v.email}</td>
                  <td className="px-4 py-3 text-center text-forest-green font-semibold">{v.points}</td>
                  <td className="px-4 py-3 text-center">
                    {v.is_active ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-eco-green/10 text-forest-green">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggle(v.id, v.is_active)}
                      disabled={cargando === v.id}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-50 ${
                        v.is_active
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-eco-green/30 text-forest-green hover:bg-eco-green/10'
                      }`}
                    >
                      {cargando === v.id ? '...' : v.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-8 text-medium-gray text-sm">
            No se encontraron voluntarios
          </div>
        )}
      </div>
    </div>
  )
}
