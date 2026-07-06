import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerTareasProximas } from '@/lib/actions/metrics'
import BadgeEstado from '@/components/BadgeEstado'
import BadgeTipo from '@/components/BadgeTipo'
import SelectorEstado from '@/components/SelectorEstado'
import type { TaskType, TaskStatus } from '@/lib/types'

function formatearFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default async function MisTareas() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, task:tasks(*)')
    .eq('volunteer_id', user.id)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })

  const tareas = (assignments ?? []).filter((a: any) => a.task?.is_active === true)

  const tareasProximas = await obtenerTareasProximas(user.id, 24)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-6">Mis tareas</h1>

      {tareasProximas.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">
            Próximas en las próximas 24h
          </h2>
          <div className="space-y-2">
            {tareasProximas.map((tarea) => (
              <Link
                key={tarea.id}
                href={`/mis-tareas/${tarea.id}`}
                className="block bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-dark-carbon truncate">{tarea.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-medium-gray">
                      <BadgeTipo type={tarea.type} />
                      <BadgeEstado status={tarea.status} />
                      <span className="text-amber-700 font-medium">
                        {new Intl.DateTimeFormat('es-AR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(tarea.scheduled_date))}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tareas.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-medium-gray">No tenés tareas asignadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map((a: any) => {
            const task = a.task as {
              id: string
              title: string
              type: TaskType
              status: TaskStatus
              scheduled_date: string
              location: string
            }

            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/mis-tareas/${task.id}`}
                    className="font-semibold text-dark-carbon truncate hover:text-forest-green transition-colors"
                  >
                    {task.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-medium-gray">
                    <BadgeTipo type={task.type} />
                    <BadgeEstado status={task.status} />
                    <span>{formatearFecha(task.scheduled_date)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <SelectorEstado taskId={task.id} statusActual={task.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
