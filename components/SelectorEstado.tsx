'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarEstadoTarea } from '@/lib/actions/tasks'
import FormularioMetricas from '@/components/FormularioMetricas'
import type { TaskStatus } from '@/lib/types'

interface Props {
  taskId: string
  statusActual: TaskStatus
}

const opciones: { valor: TaskStatus; etiqueta: string }[] = [
  { valor: 'in_progress', etiqueta: 'En progreso' },
  { valor: 'completed', etiqueta: 'Completada' },
]

export default function SelectorEstado({ taskId, statusActual }: Props) {
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarMetricas, setMostrarMetricas] = useState(false)
  const router = useRouter()

  const handleCambiar = useCallback(async (nuevoEstado: TaskStatus) => {
    if (nuevoEstado === 'completed') {
      setMostrarMetricas(true)
      return
    }

    setCargando(true)
    setMensaje('')
    setError('')

    const result = await actualizarEstadoTarea(taskId, nuevoEstado)

    if (result.success) {
      setMensaje(result.message)
      router.refresh()
    } else {
      setError(result.message)
    }

    setCargando(false)
  }, [taskId, router])

  const handleMetricasCerradas = useCallback(() => {
    setMostrarMetricas(false)
  }, [])

  if (statusActual === 'completed' || statusActual === 'cancelled') {
    return null
  }

  const disponibles = opciones.filter((o) => {
    if (statusActual === 'pending') return o.valor === 'in_progress'
    if (statusActual === 'in_progress') return o.valor === 'completed'
    return false
  })

  if (disponibles.length === 0) return null

  return (
    <div>
      {mostrarMetricas && (
        <FormularioMetricas taskId={taskId} onCerrar={handleMetricasCerradas} />
      )}

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
        {disponibles.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => handleCambiar(op.valor)}
            disabled={cargando}
            className="px-3 py-1.5 rounded text-xs font-medium border transition-colors disabled:opacity-50
              bg-forest-green text-white border-forest-green hover:bg-[#14532d]"
          >
            {cargando ? '...' : op.etiqueta}
          </button>
        ))}
      </div>
    </div>
  )
}
