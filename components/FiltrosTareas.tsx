'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { TaskStatus } from '@/lib/types'

const estados: { valor: string; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'pending', etiqueta: 'Pendiente' },
  { valor: 'in_progress', etiqueta: 'En progreso' },
  { valor: 'completed', etiqueta: 'Completada' },
  { valor: 'cancelled', etiqueta: 'Cancelada' },
]

export default function FiltrosTareas() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const estado = searchParams.get('status') ?? ''
  const fechaDesde = searchParams.get('fecha_desde') ?? ''
  const fechaHasta = searchParams.get('fecha_hasta') ?? ''
  const ubicacion = searchParams.get('ubicacion') ?? ''

  const actualizar = useCallback(
    (nombre: string, valor: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')

      if (valor) {
        params.set(nombre, valor)
      } else {
        params.delete(nombre)
      }

      startTransition(() => {
        router.push('/tareas?' + params.toString())
      })
    },
    [searchParams, router]
  )

  const limpiar = useCallback(() => {
    startTransition(() => {
      router.push('/tareas')
    })
  }, [router])

  const hayFiltros = estado || fechaDesde || fechaHasta || ubicacion

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="text-xs text-green-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => actualizar('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {estados.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => actualizar('fecha_desde', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => actualizar('fecha_hasta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
          <input
            type="text"
            placeholder="Buscar..."
            value={ubicacion}
            onChange={(e) => actualizar('ubicacion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  )
}
