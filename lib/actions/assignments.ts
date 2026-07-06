'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { registrarAuditoria } from '@/lib/actions/audit'
import type { Profile, AssignmentWithTask } from '@/lib/types'

export async function obtenerVoluntariosDisponibles(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'volunteer')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (error) {
    throw new Error('Error al obtener voluntarios: ' + error.message)
  }

  return data as Profile[]
}

export async function obtenerAsignacionDeTarea(taskId: string): Promise<{
  assignment: AssignmentWithTask | null
  voluntario: Profile | null
}> {
  const supabase = await createClient()

  const { data: assignment } = await supabase
    .from('assignments')
    .select('*')
    .eq('task_id', taskId)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    return { assignment: null, voluntario: null }
  }

  const { data: voluntario } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', assignment.volunteer_id)
    .single()

  return {
    assignment: assignment as unknown as AssignmentWithTask,
    voluntario: voluntario as Profile | null,
  }
}

export async function asignarVoluntario(taskId: string, volunteerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false as const, message: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') {
    return { success: false as const, message: 'Solo los coordinadores pueden asignar tareas' }
  }

  const { error } = await supabase.from('assignments').insert({
    task_id: taskId,
    volunteer_id: volunteerId,
    status: 'assigned',
    assigned_at: new Date().toISOString(),
  })

  if (error) {
    return { success: false as const, message: 'Error al asignar: ' + error.message }
  }

  await registrarAuditoria(taskId, user.id, 'assigned')

  revalidatePath('/tareas/' + taskId)
  revalidatePath('/tareas')

  return { success: true as const, message: 'Voluntario asignado correctamente' }
}
