import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerTareaPorId } from '@/lib/actions/tasks'
import { obtenerAsignacionDeTarea } from '@/lib/actions/assignments'
import { listarEvidenciasPorTarea } from '@/lib/actions/evidences'
import { listarComentariosPorTarea } from '@/lib/actions/comments'
import { obtenerHistorialTarea } from '@/lib/actions/audit'
import BadgeEstado from '@/components/BadgeEstado'
import BadgeTipo from '@/components/BadgeTipo'
import AsignarVoluntario from '@/components/AsignarVoluntario'
import ComentariosTarea from '@/components/ComentariosTarea'

function formatearFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatearAccion(action: string) {
  const acciones: Record<string, string> = {
    created: 'Tarea creada',
    updated: 'Tarea actualizada',
    status_changed: 'Estado cambiado',
    deactivated: 'Tarea desactivada',
    assigned: 'Voluntario asignado',
  }
  return acciones[action] ?? action
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function DetalleTarea({ params }: Props) {
  const { id } = await params
  const tarea = await obtenerTareaPorId(id)

  if (!tarea || !tarea.is_active) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const perfilUsuario = user
    ? await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => data as { id: string; full_name: string; role: string } | null)
    : null

  const { voluntario } = await obtenerAsignacionDeTarea(id)
  const [evidencias, comentarios, historial] = await Promise.all([
    listarEvidenciasPorTarea(id),
    listarComentariosPorTarea(id),
    perfilUsuario?.role === 'coordinator' ? obtenerHistorialTarea(id) : Promise.resolve([]),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/tareas"
        className="inline-flex items-center gap-1 text-sm text-forest-green hover:text-[#14532d] font-medium mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al listado
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-carbon">{tarea.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <BadgeEstado status={tarea.status} />
              <BadgeTipo type={tarea.type} />
            </div>
          </div>
          <Link
            href={`/tareas/${tarea.id}/editar`}
            className="shrink-0 bg-forest-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#14532d] transition-colors"
          >
            Editar
          </Link>
        </div>

        <div className="p-6 space-y-4">
          {tarea.description && (
            <div>
              <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
                Descripción
              </h3>
              <p className="text-dark-carbon whitespace-pre-wrap">{tarea.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
              Ubicación
            </h3>
            <p className="text-dark-carbon">{tarea.location}</p>
            {tarea.latitude && tarea.longitude && (
              <p className="text-sm text-medium-gray mt-0.5">
                {tarea.latitude}, {tarea.longitude}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
              Fecha programada
            </h3>
            <p className="text-dark-carbon">{formatearFecha(tarea.scheduled_date)}</p>
          </div>

          {perfilUsuario?.role === 'coordinator' && (
            <AsignarVoluntario
              taskId={tarea.id}
              voluntarioActual={voluntario ? { id: voluntario.id, full_name: voluntario.full_name } : null}
            />
          )}

          {evidencias.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-3">
                Evidencia fotográfica
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidencias.map((ev) => (
                  <div key={ev.id} className="relative">
                    <img
                      src={ev.image_url}
                      alt="Evidencia"
                      className="w-full h-32 object-cover rounded border border-gray-200"
                    />
                    {ev.latitude && ev.longitude && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
                Creada
              </h3>
              <p className="text-sm text-dark-carbon">{formatearFecha(tarea.created_at)}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
                Actualizada
              </h3>
              <p className="text-sm text-dark-carbon">{formatearFecha(tarea.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
        <ComentariosTarea taskId={tarea.id} />
      </div>

      {perfilUsuario?.role === 'coordinator' && historial.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
          <h2 className="text-sm font-semibold text-medium-gray uppercase tracking-wide mb-3">
            Historial de cambios
          </h2>
          <div className="space-y-3">
            {historial.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 text-xs"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-forest-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark-carbon">
                      {entry.profiles?.full_name ?? 'Desconocido'}
                    </span>
                    <span className="text-medium-gray">·</span>
                    <span className="text-medium-gray">
                      {formatearAccion(entry.action)}
                    </span>
                  </div>
                  <p className="text-medium-gray mt-0.5">
                    {new Intl.DateTimeFormat('es-AR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(entry.created_at))}
                  </p>
                  {entry.changed_fields && Object.keys(entry.changed_fields).length > 0 && (
                    <div className="mt-1 text-medium-gray">
                      {Object.entries(entry.changed_fields).map(([field, diff]) => (
                        <span key={field} className="inline-block mr-2">
                          {field}: {(diff as any).from} → {(diff as any).to}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
