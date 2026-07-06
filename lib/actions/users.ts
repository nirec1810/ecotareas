'use server'

import { createClient } from '@/lib/supabase/server'
import type { VoluntarioConEmail } from '@/lib/types'

export async function listarVoluntarios(): Promise<VoluntarioConEmail[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') {
    throw new Error('Solo los coordinadores pueden acceder')
  }

  const { data: voluntarios } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, phone, bio, is_active, points, created_at')
    .eq('role', 'volunteer')
    .order('full_name')

  if (!voluntarios) return []

  const ids = voluntarios.map((v) => v.id)

  const { data: emailsData } = await supabase
    .rpc('get_user_emails', { user_ids: ids })

  const emailsMap = new Map<string, string>()
  for (const row of (emailsData ?? []) as { id: string; email: string }[]) {
    emailsMap.set(row.id, row.email)
  }

  return voluntarios.map((v) => ({
    ...v,
    email: emailsMap.get(v.id) ?? '',
  })) as VoluntarioConEmail[]
}

export async function activarDesactivarUsuario(
  userId: string,
  activo: boolean
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: 'No autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') {
    return { success: false, message: 'Solo los coordinadores pueden realizar esta acción' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: activo })
    .eq('id', userId)

  if (error) {
    return { success: false, message: 'Error al actualizar usuario: ' + error.message }
  }

  return {
    success: true,
    message: activo ? 'Cuenta activada' : 'Cuenta desactivada',
  }
}
