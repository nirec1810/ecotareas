'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { esquemaPerfil } from '@/lib/schemas'
import type { Profile } from '@/lib/types'

export async function obtenerPerfil(): Promise<Profile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}

export async function actualizarPerfil(
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'No autorizado' }
  }

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaPerfil.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      bio: parsed.data.bio,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, message: 'Error al actualizar perfil: ' + error.message }
  }

  revalidatePath('/perfil')
  revalidatePath('/')

  return { success: true, message: 'Perfil actualizado correctamente' }
}

export async function subirAvatar(
  formData: FormData
): Promise<{ success: boolean; message: string; avatar_url?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'No autorizado' }
  }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) {
    return { success: false, message: 'Seleccioná una imagen' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, message: 'Solo se permiten imágenes' }
  }

  const bytes = await file.arrayBuffer()
  const buffer = new Uint8Array(bytes)

  const filePath = `${user.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, { contentType: file.type })

  if (uploadError) {
    return { success: false, message: 'Error al subir imagen: ' + uploadError.message }
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const avatarUrl = urlData.publicUrl

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, message: 'Error al guardar avatar: ' + updateError.message }
  }

  revalidatePath('/perfil')
  revalidatePath('/')

  return { success: true, message: 'Avatar actualizado', avatar_url: avatarUrl }
}
