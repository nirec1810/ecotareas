import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerTareaPorId } from '@/lib/actions/tasks'
import { obtenerAsignacionDeTarea } from '@/lib/actions/assignments'
import { listarEvidenciasPorTarea } from '@/lib/actions/evidences'
import { listarComentariosPorTarea } from '@/lib/actions/comments'
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
  const [evidencias, comentarios] = await Promise.all([
    listarEvidenciasPorTarea(id),
    listarComentariosPorTarea(id),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/tareas"
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Volver al listado
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tarea.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <BadgeEstado status={tarea.status} />
              <BadgeTipo type={tarea.type} />
            </div>
          </div>
          <Link
            href={`/tareas/${tarea.id}/editar`}
            className="shrink-0 bg-green-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Editar
          </Link>
        </div>

        <div className="p-6 space-y-4">
          {tarea.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Descripción
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">{tarea.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Ubicación
            </h3>
            <p className="text-gray-800">{tarea.location}</p>
            {tarea.latitude && tarea.longitude && (
              <p className="text-sm text-gray-500 mt-0.5">
                {tarea.latitude}, {tarea.longitude}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fecha programada
            </h3>
            <p className="text-gray-800">{formatearFecha(tarea.scheduled_date)}</p>
          </div>

          {perfilUsuario?.role === 'coordinator' && (
            <AsignarVoluntario
              taskId={tarea.id}
              voluntarioActual={voluntario ? { id: voluntario.id, full_name: voluntario.full_name } : null}
            />
          )}

          {evidencias.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Creada
              </h3>
              <p className="text-sm text-gray-700">{formatearFecha(tarea.created_at)}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Actualizada
              </h3>
              <p className="text-sm text-gray-700">{formatearFecha(tarea.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4 p-6">
        <ComentariosTarea taskId={tarea.id} />
      </div>
    </div>
  )
}
