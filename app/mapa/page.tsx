import { createClient } from '@/lib/supabase/server'
import MapaTareas from '@/components/MapaTareas'

export default async function PaginaMapa() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('created_at', { ascending: false })

  const tareas = data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-2">Mapa de tareas</h1>
      <p className="text-sm text-medium-gray mb-6">
        {tareas.length} tarea{tareas.length !== 1 && 's'} con ubicación
      </p>
      <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MapaTareas tareas={tareas} />
      </div>
    </div>
  )
}
