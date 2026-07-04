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

function generarPaginas(pagina: number, total: number) {
  const paginas: (number | 'ellipsis')[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= pagina - 1 && i <= pagina + 1)) {
      paginas.push(i)
    } else if (paginas[paginas.length - 1] !== 'ellipsis') {
      paginas.push('ellipsis')
    }
  }
  return paginas
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

  const paginas = generarPaginas(pagina, resultado.totalPages)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-carbon">Tareas</h1>
        <Link
          href="/tareas/nueva"
          className="bg-forest-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#14532d] transition-colors"
        >
          + Nueva tarea
        </Link>
      </div>

      <Suspense fallback={null}>
        <div className="mb-4">
          <FiltrosTareas />
        </div>
      </Suspense>

      {resultado.data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-medium-gray">
            {tieneFiltros ? 'No hay tareas que coincidan con los filtros' : 'No hay tareas registradas'}
          </p>
          {!tieneFiltros && (
            <Link
              href="/tareas/nueva"
              className="inline-block mt-3 text-forest-green hover:underline font-medium text-sm"
            >
              Crear la primera tarea
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-gray text-dark-carbon text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="text-left px-4 py-3">Título</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultado.data.map((tarea) => (
                  <tr key={tarea.id} className="even:bg-bg-gray hover:bg-bg-gray/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-dark-carbon">{tarea.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <BadgeTipo type={tarea.type} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado status={tarea.status} />
                    </td>
                    <td className="px-4 py-3 text-medium-gray hidden md:table-cell">
                      {formatearFecha(tarea.scheduled_date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tareas/${tarea.id}`}
                        className="text-forest-green hover:bg-forest-green/5 font-medium px-3 py-1.5 rounded-lg transition-colors inline-block"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-medium-gray">
              Página {resultado.page} de {resultado.totalPages} ({resultado.total} tareas)
            </span>
            <div className="flex items-center gap-1.5">
              {pagina > 1 && (
                <Link
                  href={construirUrl(pagina - 1)}
                  className="px-2.5 py-1.5 rounded border border-gray-200 text-dark-carbon hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </Link>
              )}

              {paginas.map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1 text-medium-gray">...</span>
                ) : (
                  <Link
                    key={p}
                    href={construirUrl(p)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                      p === pagina
                        ? 'bg-forest-green text-white'
                        : 'text-dark-carbon hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

              {pagina < resultado.totalPages && (
                <Link
                  href={construirUrl(pagina + 1)}
                  className="px-2.5 py-1.5 rounded border border-gray-200 text-dark-carbon hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
