'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { esquemaMetricas } from '@/lib/schemas'
import type { TaskMetrics, ImpactIndicators, Task, Assignment } from '@/lib/types'

export async function obtenerIndicadoresImpacto(): Promise<ImpactIndicators> {
  const supabase = await createClient()

  const { count: tareasCompletadas } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { data: assignmentsCompletadas } = await supabase
    .from('assignments')
    .select('volunteer_id')
    .not('completed_at', 'is', null)

  const voluntariosUnicos = new Set(
    (assignmentsCompletadas ?? []).map((a: { volunteer_id: string }) => a.volunteer_id)
  )

  const { data: metricas } = await supabase
    .from('task_metrics')
    .select('trees_planted, waste_kg')

  let arbolesPlantados = 0
  let residuosRecolectados = 0
  for (const m of (metricas ?? []) as TaskMetrics[]) {
    arbolesPlantados += m.trees_planted
    residuosRecolectados += m.waste_kg
  }

  return {
    tareasCompletadas: tareasCompletadas ?? 0,
    voluntariosParticipantes: voluntariosUnicos.size,
    arbolesPlantados,
    residuosRecolectados,
  }
}

export async function registrarMetricasTarea(
  taskId: string,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'No autorizado' }
  }

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('task_id', taskId)
    .eq('volunteer_id', user.id)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    return { success: false, message: 'No tenés esta tarea asignada' }
  }

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaMetricas.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { error } = await supabase.from('task_metrics').upsert(
    {
      task_id: taskId,
      trees_planted: parsed.data.trees_planted,
      waste_kg: parsed.data.waste_kg,
      registered_by: user.id,
    },
    { onConflict: 'task_id' }
  )

  if (error) {
    return { success: false, message: 'Error al guardar métricas: ' + error.message }
  }

  revalidatePath('/mis-tareas/' + taskId)
  revalidatePath('/dashboard')

  return { success: true, message: 'Métricas registradas correctamente' }
}

export async function obtenerTareasProximas(
  userId: string,
  ventanaHoras: number = 24
): Promise<(Task & { assignment_id: string })[]> {
  const supabase = await createClient()

  const ahora = new Date()
  const limite = new Date(ahora.getTime() + ventanaHoras * 60 * 60 * 1000)

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, task:tasks(*)')
    .eq('volunteer_id', userId)
    .neq('status', 'rejected')

  if (!assignments) return []

  const tareasProximas = (assignments as any[])
    .filter((a) => {
      const task = a.task as Task
      if (!task || !task.is_active) return false
      if (task.status !== 'pending' && task.status !== 'in_progress') return false
      const fecha = new Date(task.scheduled_date)
      return fecha >= ahora && fecha <= limite
    })
    .map((a) => {
      const task = a.task as Task
      return { ...task, assignment_id: a.id }
    })
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())

  return tareasProximas
}
