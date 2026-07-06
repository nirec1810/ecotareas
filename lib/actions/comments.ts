'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sumarPuntos } from '@/lib/actions/gamification'
import type { CommentWithAuthor } from '@/lib/types'

export async function crearComentario(taskId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false as const, message: 'No autorizado' }
  }

  const content = (formData.get('content') as string)?.trim()
  if (!content || content.length === 0) {
    return { success: false as const, message: 'El comentario no puede estar vacío' }
  }

  if (content.length > 2000) {
    return { success: false as const, message: 'Máximo 2000 caracteres' }
  }

  const { error } = await supabase.from('comments').insert({
    task_id: taskId,
    user_id: user.id,
    content,
  })

  if (error) {
    return { success: false as const, message: 'Error al crear comentario: ' + error.message }
  }

  await sumarPuntos(user.id, 1)

  revalidatePath('/mis-tareas/' + taskId)
  revalidatePath('/tareas/' + taskId)

  return { success: true as const, message: 'Comentario publicado' }
}

export async function listarComentariosPorTarea(taskId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles!inner(full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Error al listar comentarios: ' + error.message)
  }

  return (data as CommentWithAuthor[]) ?? []
}
