import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis tareas</h1>

      {tareas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No tenés tareas asignadas</p>
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
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/mis-tareas/${task.id}`}
                    className="font-semibold text-gray-900 truncate hover:text-green-700 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
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
