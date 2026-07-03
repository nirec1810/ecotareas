import Link from 'next/link'
import { Suspense } from 'react'
import { listarTareas } from '@/lib/actions/tasks'
import BadgeEstado from '@/components/BadgeEstado'
import BadgeTipo from '@/components/BadgeTipo'
import FiltrosTareas from '@/components/FiltrosTareas'
import type { TaskStatus, TaskFilters } from '@/lib/types'

function formatearFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

interface Props {
  searchParams: Promise<{ page?: string; status?: string; fecha_desde?: string; fecha_hasta?: string; ubicacion?: string }>
}

export default async function ListadoTareas({ searchParams }: Props) {
  const params = await searchParams
  const pagina = Math.max(1, Number(params.page) || 1)

  const filters: TaskFilters = {}
  if (params.status && ['pending', 'in_progress', 'completed', 'cancelled'].includes(params.status)) {
    filters.status = params.status as TaskStatus
  }
  if (params.fecha_desde) filters.fecha_desde = params.fecha_desde
  if (params.fecha_hasta) filters.fecha_hasta = params.fecha_hasta
  if (params.ubicacion) filters.ubicacion = params.ubicacion

  const tieneFiltros = Object.keys(filters).length > 0
  const resultado = await listarTareas(pagina, 10, tieneFiltros ? filters : undefined)

  const construirUrl = (page: number) => {
    const p = new URLSearchParams()
    if (page > 1) p.set('page', String(page))
    if (params.status) p.set('status', params.status)
    if (params.fecha_desde) p.set('fecha_desde', params.fecha_desde)
    if (params.fecha_hasta) p.set('fecha_hasta', params.fecha_hasta)
    if (params.ubicacion) p.set('ubicacion', params.ubicacion)
    return '/tareas' + (p.toString() ? '?' + p.toString() : '')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
        <Link
          href="/tareas/nueva"
          className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-800 transition-colors"
        >
          Nueva tarea
        </Link>
      </div>

      <Suspense fallback={null}>
        <div className="mb-4">
          <FiltrosTareas />
        </div>
      </Suspense>

      {resultado.data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            {tieneFiltros ? 'No hay tareas que coincidan con los filtros' : 'No hay tareas registradas'}
          </p>
          {!tieneFiltros && (
            <Link
              href="/tareas/nueva"
              className="inline-block mt-3 text-green-700 underline text-sm"
            >
              Crear la primera tarea
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Título</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultado.data.map((tarea) => (
                  <tr key={tarea.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{tarea.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <BadgeTipo type={tarea.type} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado status={tarea.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {formatearFecha(tarea.scheduled_date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tareas/${tarea.id}`}
                        className="text-green-700 hover:underline font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Página {resultado.page} de {resultado.totalPages} ({resultado.total} tareas)
            </span>
            <div className="flex gap-2">
              {pagina > 1 && (
                <Link
                  href={construirUrl(pagina - 1)}
                  className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {pagina < resultado.totalPages && (
                <Link
                  href={construirUrl(pagina + 1)}
                  className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
