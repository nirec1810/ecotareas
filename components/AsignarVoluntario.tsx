'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerVoluntariosDisponibles, asignarVoluntario } from '@/lib/actions/assignments'
import type { Profile } from '@/lib/types'

interface Props {
  taskId: string
  voluntarioActual: { id: string; full_name: string } | null
}

export default function AsignarVoluntario({ taskId, voluntarioActual }: Props) {
  const [voluntarios, setVoluntarios] = useState<Profile[]>([])
  const [seleccionado, setSeleccionado] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarSelector, setMostrarSelector] = useState(!voluntarioActual)
  const router = useRouter()

  useEffect(() => {
    obtenerVoluntariosDisponibles()
      .then(setVoluntarios)
      .catch(() => setError('Error al cargar voluntarios'))
  }, [])

  const handleAsignar = useCallback(async () => {
    if (!seleccionado) return

    setCargando(true)
    setMensaje('')
    setError('')

    const result = await asignarVoluntario(taskId, seleccionado)

    if (result.success) {
      setMensaje(result.message)
      router.refresh()
    } else {
      setError(result.message)
    }

    setCargando(false)
  }, [seleccionado, taskId, router])

  return (
    <div className="border-t border-gray-100 pt-4">
      <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-3">
        Voluntario asignado
      </h3>

      {voluntarioActual && !mostrarSelector ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-medium-gray">
            <span className="font-medium text-dark-carbon">{voluntarioActual.full_name}</span>
          </p>
          <button
            type="button"
            onClick={() => setMostrarSelector(true)}
            className="text-xs text-forest-green hover:text-[#14532d] font-medium"
          >
            Reasignar
          </button>
        </div>
      ) : (
        <>
          {mensaje && (
            <div className="mb-2 p-2 rounded bg-eco-green/10 border border-eco-green/30 text-forest-green text-xs">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="mb-2 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={seleccionado}
              onChange={(e) => setSeleccionado(e.target.value)}
              className="flex-1 px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
            >
              <option value="">Seleccionar voluntario</option>
              {voluntarios.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.full_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAsignar}
              disabled={!seleccionado || cargando}
              className="px-4 py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
            >
              {cargando ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
