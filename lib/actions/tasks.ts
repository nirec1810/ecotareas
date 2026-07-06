'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { esquemaTarea, esquemaMetricas } from '@/lib/schemas'
import { registrarAuditoria } from '@/lib/actions/audit'
import { sumarPuntos } from '@/lib/actions/gamification'
import type { Task, PaginatedResult, TaskStatus, TaskFilters } from '@/lib/types'

async function verificarCoordinator(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') {
    throw new Error('Solo los coordinadores pueden realizar esta acción')
  }

  return user
}

export async function crearTarea(formData: FormData) {
  const supabase = await createClient()
  const user = await verificarCoordinator(supabase)

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaTarea.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      location: parsed.data.location,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      scheduled_date: parsed.data.scheduled_date,
      status: 'pending',
      is_active: true,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return {
      success: false as const,
      message: 'Error al crear la tarea: ' + error.message,
    }
  }

  await registrarAuditoria(data.id, user.id, 'created')

  revalidatePath('/tareas')
  redirect('/tareas')
}

export async function listarTareas(
  page: number = 1,
  pageSize: number = 10,
  filters?: TaskFilters
): Promise<PaginatedResult<Task>> {
  const supabase = await createClient()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let countQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  let dataQuery = supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)

  if (filters?.status) {
    countQuery = countQuery.eq('status', filters.status)
    dataQuery = dataQuery.eq('status', filters.status)
  }
  if (filters?.fecha_desde) {
    countQuery = countQuery.gte('scheduled_date', filters.fecha_desde)
    dataQuery = dataQuery.gte('scheduled_date', filters.fecha_desde)
  }
  if (filters?.fecha_hasta) {
    countQuery = countQuery.lte('scheduled_date', filters.fecha_hasta + 'T23:59:59')
    dataQuery = dataQuery.lte('scheduled_date', filters.fecha_hasta + 'T23:59:59')
  }
  if (filters?.ubicacion) {
    countQuery = countQuery.ilike('location', `%${filters.ubicacion}%`)
    dataQuery = dataQuery.ilike('location', `%${filters.ubicacion}%`)
  }

  const { count } = await countQuery

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error('Error al listar tareas: ' + error.message)
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data as Task[]) ?? [],
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function obtenerTareaPorId(id: string): Promise<Task | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as Task
}

export async function actualizarTarea(id: string, formData: FormData) {
  const supabase = await createClient()
  const user = await verificarCoordinator(supabase)

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaTarea.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { data: tareaAnterior } = await supabase
    .from('tasks')
    .select('title, description, type, location, latitude, longitude, scheduled_date')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      location: parsed.data.location,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      scheduled_date: parsed.data.scheduled_date,
    })
    .eq('id', id)

  if (error) {
    return {
      success: false as const,
      message: 'Error al actualizar la tarea: ' + error.message,
    }
  }

  const changedFields: Record<string, any> = {}
  if (tareaAnterior) {
    const nuevos = parsed.data
    for (const key of Object.keys(nuevos) as (keyof typeof nuevos)[]) {
      if (JSON.stringify((tareaAnterior as any)[key]) !== JSON.stringify(nuevos[key])) {
        changedFields[key] = { from: (tareaAnterior as any)[key], to: nuevos[key] }
      }
    }
  }
  await registrarAuditoria(id, user.id, 'updated', changedFields)

  revalidatePath('/tareas')
  redirect('/tareas/' + id)
}

export async function desactivarTarea(id: string) {
  const supabase = await createClient()
  const user = await verificarCoordinator(supabase)

  const { error } = await supabase
    .from('tasks')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return {
      success: false as const,
      message: 'Error al desactivar la tarea: ' + error.message,
    }
  }

  await registrarAuditoria(id, user.id, 'deactivated')

  revalidatePath('/tareas')
  redirect('/tareas')
}

export async function actualizarEstadoTarea(taskId: string, nuevoEstado: TaskStatus) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false as const, message: 'No autorizado' }
  }

  const { data: assignment } = await supabase
    .from('assignments')
    .select('id, status')
    .eq('task_id', taskId)
    .eq('volunteer_id', user.id)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    return { success: false as const, message: 'No tenés esta tarea asignada' }
  }

  const { data: tarea } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  if (!tarea) {
    return { success: false as const, message: 'Tarea no encontrada' }
  }

  const transiciones: Record<TaskStatus, TaskStatus[]> = {
    pending: ['in_progress'],
    in_progress: ['completed'],
    completed: [],
    cancelled: [],
  }

  if (!transiciones[tarea.status as TaskStatus]?.includes(nuevoEstado)) {
    return {
      success: false as const,
      message: `No se puede cambiar de "${tarea.status}" a "${nuevoEstado}"`,
    }
  }

  if (nuevoEstado === 'completed') {
    return { success: false as const, requiresMetrics: true as const, message: 'Completar' }
  }

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ status: nuevoEstado })
    .eq('id', taskId)

  if (taskError) {
    return { success: false as const, message: 'Error al actualizar estado: ' + taskError.message }
  }

  await registrarAuditoria(taskId, user.id, 'status_changed')

  revalidatePath('/mis-tareas')
  revalidatePath('/tareas')

  return { success: true as const, message: 'Estado actualizado correctamente' }
}

export async function confirmarCompletarTarea(
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
    .select('id, status')
    .eq('task_id', taskId)
    .eq('volunteer_id', user.id)
    .neq('status', 'rejected')
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    return { success: false, message: 'No tenés esta tarea asignada' }
  }

  const { data: tarea } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', taskId)
    .single()

  if (!tarea || (tarea.status !== 'in_progress' && tarea.status !== 'pending')) {
    return { success: false, message: 'La tarea no se puede completar' }
  }

  if (tarea.status === 'pending') {
    const { count: evidenciaCount } = await supabase
      .from('evidences')
      .select('id', { count: 'exact', head: true })
      .eq('task_id', taskId)
      .eq('user_id', user.id)

    const { count: comentariosCount } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('task_id', taskId)
      .eq('user_id', user.id)

    if (!evidenciaCount || !comentariosCount) {
      return {
        success: false,
        message: 'Debés subir al menos una imagen y hacer un comentario antes de completar',
      }
    }
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

  const { error: metricError } = await supabase.from('task_metrics').upsert(
    {
      task_id: taskId,
      trees_planted: parsed.data.trees_planted,
      waste_kg: parsed.data.waste_kg,
      registered_by: user.id,
    },
    { onConflict: 'task_id' }
  )

  if (metricError) {
    return { success: false, message: 'Error al guardar métricas: ' + metricError.message }
  }

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)

  if (taskError) {
    return { success: false, message: 'Error al actualizar estado: ' + taskError.message }
  }

  await supabase
    .from('assignments')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', assignment.id)

  await registrarAuditoria(taskId, user.id, 'status_changed')

  await sumarPuntos(user.id, 10)

  revalidatePath('/mis-tareas')
  revalidatePath('/tareas')
  revalidatePath('/dashboard')

  return { success: true, message: 'Tarea completada correctamente' }
}
