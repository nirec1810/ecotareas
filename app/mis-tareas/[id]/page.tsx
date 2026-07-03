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
      <div className="mb-6">
        <Link
          href="/mis-tareas"
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Volver a Mis tareas
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">{tarea.title}</h1>
        <div className="mt-2 flex items-center gap-3 mb-4">
          <BadgeEstado status={tarea.status} />
          <BadgeTipo type={tarea.type} />
        </div>

        <SelectorEstado taskId={tarea.id} statusActual={tarea.status} />

        {tarea.description && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Descripción
            </h3>
            <p className="text-gray-800 whitespace-pre-wrap">{tarea.description}</p>
          </div>
        )}

        <div className="mt-4">
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

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Fecha programada
          </h3>
          <p className="text-gray-800">{formatearFecha(tarea.scheduled_date)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4 p-6">
        <SubirEvidencia taskId={tarea.id} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4 p-6">
        <ComentariosTarea taskId={tarea.id} />
      </div>
    </div>
  )
}
