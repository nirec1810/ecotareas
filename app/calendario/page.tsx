import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CalendarioTareas from '@/components/CalendarioTareas'
import type { Task } from '@/lib/types'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') redirect('/mis-tareas')

  const { data: tareas } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-6">Calendario de brigadas</h1>
      <CalendarioTareas tareas={(tareas as Task[]) ?? []} />
    </div>
  )
}
