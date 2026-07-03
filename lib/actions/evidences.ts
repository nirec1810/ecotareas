'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Evidence } from '@/lib/types'

export async function subirEvidencia(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false as const, message: 'No autorizado' }
  }

  const taskId = formData.get('taskId') as string
  if (!taskId) {
    return { success: false as const, message: 'Falta el ID de la tarea' }
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
    return { success: false as const, message: 'No tenés esta tarea asignada' }
  }

  const file = formData.get('image') as File
  if (!file || file.size === 0) {
    return { success: false as const, message: 'Seleccioná una imagen' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false as const, message: 'Solo se permiten imágenes' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)

  const filePath = `${user.id}/${taskId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('evidencias')
    .upload(filePath, buffer, { contentType: file.type })

  if (uploadError) {
    return { success: false as const, message: 'Error al subir imagen: ' + uploadError.message }
  }

  const { data: urlData } = supabase.storage
    .from('evidencias')
    .getPublicUrl(filePath)

  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null

  const { error: insertError } = await supabase.from('evidences').insert({
    task_id: taskId,
    user_id: user.id,
    image_url: urlData.publicUrl,
    latitude,
    longitude,
  })

  if (insertError) {
    return { success: false as const, message: 'Error al registrar evidencia: ' + insertError.message }
  }

  revalidatePath('/mis-tareas/' + taskId)
  revalidatePath('/tareas/' + taskId)

  return { success: true as const, message: 'Evidencia subida correctamente' }
}

export async function listarEvidenciasPorTarea(taskId: string): Promise<Evidence[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('evidences')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Error al listar evidencias: ' + error.message)
  }

  return (data as Evidence[]) ?? []
}
