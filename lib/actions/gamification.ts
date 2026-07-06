import { createClient } from '@/lib/supabase/server'
import type { Badge, RankingEntry } from '@/lib/types'

export async function sumarPuntos(userId: string, puntos: number): Promise<void> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single()

  if (!profile) return

  const nuevosPuntos = (profile.points ?? 0) + puntos

  await supabase
    .from('profiles')
    .update({ points: nuevosPuntos })
    .eq('id', userId)

  await verificarInsignias(userId, nuevosPuntos)
}

async function verificarInsignias(userId: string, puntosActuales: number): Promise<void> {
  const supabase = await createClient()

  const { data: insigniasDisponibles } = await supabase
    .from('badges')
    .select('*')
    .lte('threshold_points', puntosActuales)

  if (!insigniasDisponibles) return

  const { data: insigniasExistentes } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  const insigniasExistentesIds = new Set(
    (insigniasExistentes ?? []).map((ie: { badge_id: string }) => ie.badge_id)
  )

  const nuevasInsignias = (insigniasDisponibles as Badge[])
    .filter((b) => !insigniasExistentesIds.has(b.id))
    .map((b) => ({ user_id: userId, badge_id: b.id }))

  if (nuevasInsignias.length > 0) {
    await supabase.from('user_badges').insert(nuevasInsignias)
  }
}

export async function obtenerRanking(): Promise<RankingEntry[]> {
  const supabase = await createClient()

  const { data: voluntarios } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, points')
    .eq('role', 'volunteer')
    .eq('is_active', true)
    .order('points', { ascending: false })

  if (!voluntarios) return []

  const { data: todasLasInsignias } = await supabase
    .from('user_badges')
    .select('user_id, badge:badges(*)')

  const insigniasPorUsuario = new Map<string, Badge[]>()
  for (const ib of (todasLasInsignias ?? []) as any[]) {
    const lista = insigniasPorUsuario.get(ib.user_id) ?? []
    if (ib.badge) lista.push(ib.badge as Badge)
    insigniasPorUsuario.set(ib.user_id, lista)
  }

  return voluntarios.map((v, index) => ({
    id: v.id,
    full_name: v.full_name,
    avatar_url: v.avatar_url,
    points: v.points,
    position: index + 1,
    badges: insigniasPorUsuario.get(v.id) ?? [],
  }))
}

export async function obtenerInsigniasUsuario(userId: string): Promise<Badge[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_badges')
    .select('badge:badges(*)')
    .eq('user_id', userId)

  return ((data ?? []) as any[]).map((item) => item.badge as Badge).filter(Boolean)
}
