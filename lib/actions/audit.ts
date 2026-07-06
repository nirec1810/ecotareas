import { createClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/lib/types'

export async function registrarAuditoria(
  taskId: string,
  userId: string,
  action: string,
  changedFields?: Record<string, any>
): Promise<void> {
  const supabase = await createClient()

  const insertData: any = {
    task_id: taskId,
    user_id: userId,
    action,
  }
  if (changedFields && Object.keys(changedFields).length > 0) {
    insertData.changed_fields = changedFields
  }

  await supabase.from('task_audit_log').insert(insertData)
}

export async function obtenerHistorialTarea(taskId: string): Promise<AuditLog[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('task_audit_log')
    .select('*, profiles!inner(full_name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Error al obtener historial: ' + error.message)
  }

  return (data as AuditLog[]) ?? []
}
