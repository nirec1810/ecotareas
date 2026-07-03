'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { esquemaTarea } from '@/lib/schemas'
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
  await verificarCoordinator(supabase)

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
    })
    .select()
    .single()

  if (error) {
    return {
      success: false as const,
      message: 'Error al crear la tarea: ' + error.message,
    }
  }

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
  await verificarCoordinator(supabase)

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaTarea.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

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

  revalidatePath('/tareas')
  redirect('/tareas/' + id)
}

export async function desactivarTarea(id: string) {
  const supabase = await createClient()
  await verificarCoordinator(supabase)

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

  const { error: taskError } = await supabase
    .from('tasks')
    .update({ status: nuevoEstado })
    .eq('id', taskId)

  if (taskError) {
    return { success: false as const, message: 'Error al actualizar estado: ' + taskError.message }
  }

  if (nuevoEstado === 'completed') {
    await supabase
      .from('assignments')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', assignment.id)
  }

  revalidatePath('/mis-tareas')
  revalidatePath('/tareas')

  return { success: true as const, message: 'Estado actualizado correctamente' }
}
