import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerTareaPorId } from '@/lib/actions/tasks'
import BadgeEstado from '@/components/BadgeEstado'
import BadgeTipo from '@/components/BadgeTipo'
import SelectorEstado from '@/components/SelectorEstado'
import SubirEvidencia from '@/components/SubirEvidencia'
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

export default async function DetalleMisTarea({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { count: evidenciaCount } = await supabase
    .from('evidences')
    .select('id', { count: 'exact', head: true })
    .eq('task_id', id)
    .eq('user_id', user.id)

  const { count: comentariosCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('task_id', id)
    .eq('user_id', user.id)

  const tieneEvidencia = (evidenciaCount ?? 0) > 0
  const tieneComentarios = (comentariosCount ?? 0) > 0

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('task_id', id)
    .eq('volunteer_id', user.id)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    notFound()
  }

  const tarea = await obtenerTareaPorId(id)
  if (!tarea || !tarea.is_active) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/mis-tareas"
        className="inline-flex items-center gap-1 text-sm text-forest-green hover:text-[#14532d] font-medium mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Mis tareas
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark-carbon">{tarea.title}</h1>
        <div className="mt-2 flex items-center gap-3 mb-4">
          <BadgeEstado status={tarea.status} />
          <BadgeTipo type={tarea.type} />
        </div>

        <SelectorEstado
          taskId={tarea.id}
          statusActual={tarea.status}
          tieneEvidencia={tieneEvidencia}
          tieneComentarios={tieneComentarios}
        />

        {tarea.description && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
              Descripción
            </h3>
            <p className="text-dark-carbon whitespace-pre-wrap">{tarea.description}</p>
          </div>
        )}

        <div className="mt-4">
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

        <div className="mt-4">
          <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
            Fecha programada
          </h3>
          <p className="text-dark-carbon">{formatearFecha(tarea.scheduled_date)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
        <SubirEvidencia taskId={tarea.id} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
        <ComentariosTarea taskId={tarea.id} />
      </div>
    </div>
  )
}
